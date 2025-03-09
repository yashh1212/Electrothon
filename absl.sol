pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

contract AbsoluteExamAI is AccessControl, ChainlinkClient, ConfirmedOwner, ERC721Enumerable {
    using EnumerableSet for EnumerableSet.AddressSet;
    using Chainlink for Chainlink.Request;

    enum ExamType { MCQ, THEORY, MIXED }
    enum ProctoringLevel { NONE, BASIC, STRICT }

    struct ExamConfig {
        ExamType examType;
        ProctoringLevel proctoring;
        bool negativeMarking;
        uint256 negativeMarkValue;
        uint256 maxParticipants;
        uint256 startTime;
        uint256 endTime;
        string ipfsQuestionsHash;
    }

    struct ExamInstance {
        uint256 examId;
        address creator;
        ExamConfig config;
        bool isActive;
        EnumerableSet.AddressSet participants;
    }

    struct ProctoringData {
        bytes32 faceBiometricHash;
        bytes32 deviceFingerprint;
        uint256 eyeMovementFlags;
        uint256 tabSwitchCount;
        bool isVerified;
    }

    struct GradingRequest {
        uint256 examId;
        address student;
        string ipfsAnswerHash;
        bool isProcessed;
    }

    struct CertificateData {
        uint256 examId;
        uint256 score;
        uint256 percentile;
        string skillsJson;
    }

    mapping(uint256 => ExamInstance) private _exams;
    uint256 private _examCounter;
    mapping(uint256 => mapping(address => ProctoringData)) private _proctoringRecords;
    mapping(uint256 => EnumerableSet.AddressSet) private _bannedStudents;
    mapping(bytes32 => GradingRequest) private _pendingRequests;
    mapping(uint256 => mapping(address => uint256)) private _scores;
    mapping(uint256 => CertificateData) private _certificateData;

    bytes32 public constant EXAM_ADMIN = keccak256("EXAM_ADMIN");
    bytes32 public constant CERTIFICATE_ISSUER = keccak256("CERTIFICATE_ISSUER");
    string private _baseTokenURI;

    address private _oracle;
    bytes32 private _jobId;
    uint256 private _fee;

    event ExamCreated(uint256 indexed examId, address creator);
    event ExamUpdated(uint256 indexed examId, ProctoringLevel newLevel);
    event CheatingDetected(uint256 indexed examId, address student);
    event GradingCompleted(uint256 examId, address student, uint256 score);
    event CertificateIssued(uint256 indexed tokenId, address student, uint256 examId);

    constructor(
        address linkToken,
        address oracleAddress,
        bytes32 jobIdBytes,
        uint256 oracleFee
    ) ERC721("AbsoluteExamAI Certificate", "AAIC") ConfirmedOwner(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EXAM_ADMIN, msg.sender);
        _grantRole(CERTIFICATE_ISSUER, msg.sender);

        _setChainlinkToken(linkToken);
        _oracle = oracleAddress;
        _jobId = jobIdBytes;
        _fee = oracleFee;
    }

    // Interface resolution for ERC165
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function createExam(
        ExamType _examType,
        ProctoringLevel _proctoring,
        bool _negativeMarking,
        uint256 _negativeMarkValue,
        uint256 _maxParticipants,
        uint256 _duration,
        string calldata _ipfsHash
    ) external onlyRole(EXAM_ADMIN) returns (uint256 examId) {
        examId = ++_examCounter;
        ExamInstance storage exam = _exams[examId];
        
        exam.examId = examId;
        exam.creator = msg.sender;
        exam.config = ExamConfig(
            _examType,
            _proctoring,
            _negativeMarking,
            _negativeMarkValue,
            _maxParticipants,
            block.timestamp,
            block.timestamp + _duration,
            _ipfsHash
        );
        exam.isActive = true;

        emit ExamCreated(examId, msg.sender);
    }

    function recordProctoringEvent(
        uint256 _examId,
        address _student,
        bytes32 _faceHash,
        bytes32 _deviceHash,
        uint256 _eyeFlags,
        uint256 _tabSwitches
    ) external onlyOwner {
        ProctoringData storage data = _proctoringRecords[_examId][_student];
        
        require(data.faceBiometricHash != _faceHash, "Stale biometric data");
        
        data.faceBiometricHash = _faceHash;
        data.deviceFingerprint = _deviceHash;
        data.eyeMovementFlags |= _eyeFlags;
        data.tabSwitchCount += _tabSwitches;

        if (_tabSwitches > 3 || _eyeFlags & 0x1 != 0) {
            _bannedStudents[_examId].add(_student);
            emit CheatingDetected(_examId, _student);
        } else {
            data.isVerified = true;
        }
    }

    function fulfill(bytes32 _requestId, uint256 _score)
        external
        recordChainlinkFulfillment(_requestId)
    {
        GradingRequest memory request = _pendingRequests[_requestId];
        require(!request.isProcessed, "Request already processed");
        
        _scores[request.examId][request.student] = _score;
        delete _pendingRequests[_requestId];
        
        emit GradingCompleted(request.examId, request.student, _score);
    }

    function mintCertificate(
        address _student,
        uint256 _examId,
        uint256 _score,
        uint256 _percentile,
        string calldata _skills
    ) external onlyRole(CERTIFICATE_ISSUER) returns (uint256 tokenId) {
        tokenId = totalSupply() + 1;
        _safeMint(_student, tokenId);
        _certificateData[tokenId] = CertificateData(
            _examId,
            _score,
            _percentile,
            _skills
        );
        
        emit CertificateIssued(tokenId, _student, _examId);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string memory newBaseURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = newBaseURI;
    }

    function getScore(uint256 examId, address student) public view returns (uint256) {
        return _scores[examId][student];
    }

    function isBanned(uint256 examId, address student) public view returns (bool) {
        return _bannedStudents[examId].contains(student);
    }
}
