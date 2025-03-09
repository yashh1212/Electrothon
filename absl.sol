// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AbsoluteExamAI (Expanded)
 * @dev A comprehensive smart contract for managing exams, proctoring, grading, and certificate issuance.
 */
contract AbsoluteExamAI {
    // Enum definitions for exam types and proctoring levels
    enum ExamType { MCQ, THEORY, MIXED }
    enum ProctoringLevel { NONE, BASIC, STRICT }

    // Struct definitions for exam configuration, instance, proctoring data, and certificate data
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
        address[] participants;
    }

    struct ProctoringData {
        bytes32 faceBiometricHash;
        bytes32 deviceFingerprint;
        uint256 eyeMovementFlags;
        uint256 tabSwitchCount;
        bool isVerified;
    }

    struct CertificateData {
        uint256 examId;
        uint256 score;
        uint256 percentile;
        string skillsJson;
    }

    // Mappings to store exam instances, proctoring records, banned students, scores, and certificate data
    mapping(uint256 => ExamInstance) private _exams;
    uint256 private _examCounter;
    mapping(uint256 => mapping(address => ProctoringData)) private _proctoringRecords;
    mapping(uint256 => address[]) private _bannedStudents;
    mapping(uint256 => mapping(address => uint256)) private _scores;
    mapping(uint256 => CertificateData) private _certificateData;

    // Events
    event ExamCreated(uint256 indexed examId, address creator);
    event ExamUpdated(uint256 indexed examId, ProctoringLevel newLevel);
    event ExamEnded(uint256 indexed examId);
    event ParticipantAdded(uint256 indexed examId, address participant);
    event ParticipantRemoved(uint256 indexed examId, address participant);
    event CheatingDetected(uint256 indexed examId, address student);
    event GradingCompleted(uint256 examId, address student, uint256 score);
    event CertificateIssued(uint256 indexed tokenId, address student, uint256 examId);

    /**
     * @dev Creates a new exam with the specified configuration.
     * @param _examType Type of the exam (MCQ, THEORY, MIXED).
     * @param _proctoring Proctoring level (NONE, BASIC, STRICT).
     * @param _negativeMarking Whether negative marking is enabled.
     * @param _negativeMarkValue Value of negative marks.
     * @param _maxParticipants Maximum number of participants.
     * @param _duration Duration of the exam in seconds.
     * @param _ipfsHash IPFS hash of the exam questions.
     * @return examId The ID of the newly created exam.
     */
    function createExam(
        ExamType _examType,
        ProctoringLevel _proctoring,
        bool _negativeMarking,
        uint256 _negativeMarkValue,
        uint256 _maxParticipants,
        uint256 _duration,
        string calldata _ipfsHash
    ) external returns (uint256 examId) {
        require(_duration > 0, "Duration must be greater than 0");
        require(_maxParticipants > 0, "Max participants must be greater than 0");

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

    /**
     * @dev Updates the proctoring level of an exam.
     * @param examId The ID of the exam.
     * @param newLevel The new proctoring level.
     */
    function updateProctoringLevel(uint256 examId, ProctoringLevel newLevel) external {
        require(_exams[examId].creator == msg.sender, "Only exam creator can update");
        require(_exams[examId].isActive, "Exam is not active");

        _exams[examId].config.proctoring = newLevel;
        emit ExamUpdated(examId, newLevel);
    }

    /**
     * @dev Ends an exam and deactivates it.
     * @param examId The ID of the exam.
     */
    function endExam(uint256 examId) external {
        require(_exams[examId].creator == msg.sender, "Only exam creator can end exam");
        require(_exams[examId].isActive, "Exam is not active");

        _exams[examId].isActive = false;
        emit ExamEnded(examId);
    }

    /**
     * @dev Adds a participant to an exam.
     * @param examId The ID of the exam.
     * @param participant The address of the participant.
     */
    function addParticipant(uint256 examId, address participant) external {
        require(_exams[examId].isActive, "Exam is not active");
        require(_exams[examId].participants.length < _exams[examId].config.maxParticipants, "Max participants reached");

        _exams[examId].participants.push(participant);
        emit ParticipantAdded(examId, participant);
    }

    /**
     * @dev Removes a participant from an exam.
     * @param examId The ID of the exam.
     * @param participant The address of the participant.
     */
    function removeParticipant(uint256 examId, address participant) external {
        require(_exams[examId].creator == msg.sender, "Only exam creator can remove participants");

        address[] storage participants = _exams[examId].participants;
        for (uint256 i = 0; i < participants.length; i++) {
            if (participants[i] == participant) {
                participants[i] = participants[participants.length - 1];
                participants.pop();
                emit ParticipantRemoved(examId, participant);
                return;
            }
        }
        revert("Participant not found");
    }

    /**
     * @dev Records proctoring events for a student during an exam.
     * @param _examId The ID of the exam.
     * @param _student The address of the student.
     * @param _faceHash The hash of the student's face biometric data.
     * @param _deviceHash The hash of the student's device fingerprint.
     * @param _eyeFlags Flags indicating eye movement anomalies.
     * @param _tabSwitches Number of tab switches detected.
     */
    function recordProctoringEvent(
        uint256 _examId,
        address _student,
        bytes32 _faceHash,
        bytes32 _deviceHash,
        uint256 _eyeFlags,
        uint256 _tabSwitches
    ) external {
        require(_exams[_examId].isActive, "Exam is not active");

        ProctoringData storage data = _proctoringRecords[_examId][_student];
        
        require(data.faceBiometricHash != _faceHash, "Stale biometric data");
        
        data.faceBiometricHash = _faceHash;
        data.deviceFingerprint = _deviceHash;
        data.eyeMovementFlags |= _eyeFlags;
        data.tabSwitchCount += _tabSwitches;

        if (_tabSwitches > 3 || _eyeFlags & 0x1 != 0) {
            _bannedStudents[_examId].push(_student);
            emit CheatingDetected(_examId, _student);
        } else {
            data.isVerified = true;
        }
    }

    /**
     * @dev Mints a certificate for a student who has completed an exam.
     * @param _student The address of the student.
     * @param _examId The ID of the exam.
     * @param _score The score obtained by the student.
     * @param _percentile The percentile of the student.
     * @param _skills JSON string representing the skills of the student.
     */
    function mintCertificate(
        address _student,
        uint256 _examId,
        uint256 _score,
        uint256 _percentile,
        string calldata _skills
    ) external {
        require(_exams[_examId].creator == msg.sender, "Only exam creator can mint certificates");

        uint256 tokenId = _examId; // Use examId as tokenId for simplicity
        _certificateData[tokenId] = CertificateData(
            _examId,
            _score,
            _percentile,
            _skills
        );
        
        emit CertificateIssued(tokenId, _student, _examId);
    }

    /**
     * @dev Retrieves the score of a student for a specific exam.
     * @param examId The ID of the exam.
     * @param student The address of the student.
     * @return uint256 The score of the student.
     */
    function getScore(uint256 examId, address student) public view returns (uint256) {
        return _scores[examId][student];
    }

    /**
     * @dev Checks if a student is banned from a specific exam.
     * @param examId The ID of the exam.
     * @param student The address of the student.
     * @return bool Whether the student is banned.
     */
    function isBanned(uint256 examId, address student) public view returns (bool) {
        for (uint256 i = 0; i < _bannedStudents[examId].length; i++) {
            if (_bannedStudents[examId][i] == student) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Retrieves the certificate data for a specific token ID.
     * @param tokenId The ID of the certificate.
     * @return CertificateData The certificate data.
     */
    function getCertificateData(uint256 tokenId) public view returns (CertificateData memory) {
        return _certificateData[tokenId];
    }

    /**
     * @dev Retrieves the list of participants for a specific exam.
     * @param examId The ID of the exam.
     * @return address[] The list of participants.
     */
    function getParticipants(uint256 examId) public view returns (address[] memory) {
        return _exams[examId].participants;
    }

    /**
     * @dev Retrieves the list of banned students for a specific exam.
     * @param examId The ID of the exam.
     * @return address[] The list of banned students.
     */
    function getBannedStudents(uint256 examId) public view returns (address[] memory) {
        return _bannedStudents[examId];
    }

    /**
     * @dev Retrieves the exam configuration for a specific exam.
     * @param examId The ID of the exam.
     * @return ExamConfig The exam configuration.
     */
    function getExamConfig(uint256 examId) public view returns (ExamConfig memory) {
        return _exams[examId].config;
    }

    /**
     * @dev Retrieves the proctoring data for a specific student in an exam.
     * @param examId The ID of the exam.
     * @param student The address of the student.
     * @return ProctoringData The proctoring data.
     */
    function getProctoringData(uint256 examId, address student) public view returns (ProctoringData memory) {
        return _proctoringRecords[examId][student];
    }
}