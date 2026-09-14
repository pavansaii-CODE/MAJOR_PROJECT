// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CertificateVerification
 * @dev Smart contract for decentralized certificate verification
 * @notice Stores cryptographic hashes of certificates on the blockchain for tamper-proof verification
 */
contract CertificateVerification {

    // Structure to store certificate verification details
    struct CertificateRecord {
        bytes32 certificateHash;    // SHA-256 hash of the certificate
        string ipfsCid;             // IPFS Content Identifier
        address studentAddress;      // Ethereum address of the student
        string studentId;           // Student ID (optional identifier)
        uint256 timestamp;          // Timestamp of registration
        bool isVerified;            // Verification status
    }

    // Mapping from certificate hash to its record
    mapping(bytes32 => CertificateRecord) public certificates;

    // Mapping to check if a certificate hash has been registered
    mapping(bytes32 => bool) public isRegistered;

    // Mapping to track certificates by student address
    mapping(address => bytes32[]) public studentCertificates;

    // Contract owner
    address public owner;

    // Events
    event CertificateRegistered(
        bytes32 indexed certificateHash,
        string ipfsCid,
        address indexed studentAddress,
        string studentId,
        uint256 timestamp
    );

    event CertificateVerified(
        bytes32 indexed certificateHash,
        address indexed verifier,
        uint256 timestamp
    );

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can call this function");
        _;
    }

    modifier notAlreadyRegistered(bytes32 _certHash) {
        require(!isRegistered[_certHash], "Certificate already registered");
        _;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Register a new certificate on the blockchain
     * @param _certHash SHA-256 hash of the certificate (as bytes32)
     * @param _ipfsCid IPFS Content Identifier where certificate is stored
     * @param _studentId Student identification number
     */
    function registerCertificate(
        bytes32 _certHash,
        string memory _ipfsCid,
        string memory _studentId
    ) public notAlreadyRegistered(_certHash) returns (bool) {
        require(_certHash != bytes32(0), "Invalid certificate hash");
        require(bytes(_ipfsCid).length > 0, "IPFS CID required");

        // Create certificate record
        certificates[_certHash] = CertificateRecord({
            certificateHash: _certHash,
            ipfsCid: _ipfsCid,
            studentAddress: msg.sender,
            studentId: _studentId,
            timestamp: block.timestamp,
            isVerified: true
        });

        // Mark as registered
        isRegistered[_certHash] = true;

        // Add to student's certificate list
        studentCertificates[msg.sender].push(_certHash);

        // Emit event
        emit CertificateRegistered(
            _certHash,
            _ipfsCid,
            msg.sender,
            _studentId,
            block.timestamp
        );

        return true;
    }

    /**
     * @dev Verify if a certificate exists on the blockchain
     * @param _certHash SHA-256 hash of the certificate to verify
     * @return exists Whether the certificate is registered
     * @return record The complete certificate record
     */
    function verifyCertificate(bytes32 _certHash)
        public
        view
        returns (bool exists, CertificateRecord memory record)
    {
        exists = isRegistered[_certHash];
        if (exists) {
            record = certificates[_certHash];
        }
    }

    /**
     * @dev Get certificate details by hash
     * @param _certHash The certificate hash
     * @return The certificate record
     */
    function getCertificate(bytes32 _certHash)
        public
        view
        returns (CertificateRecord memory)
    {
        require(isRegistered[_certHash], "Certificate not found");
        return certificates[_certHash];
    }

    /**
     * @dev Check if a certificate hash is registered
     * @param _certHash The certificate hash to check
     * @return Boolean indicating if registered
     */
    function isCertificateRegistered(bytes32 _certHash)
        public
        view
        returns (bool)
    {
        return isRegistered[_certHash];
    }

    /**
     * @dev Get all certificate hashes for a student address
     * @param _studentAddress The student's Ethereum address
     * @return Array of certificate hashes
     */
    function getStudentCertificates(address _studentAddress)
        public
        view
        returns (bytes32[] memory)
    {
        return studentCertificates[_studentAddress];
    }

    /**
     * @dev Get the number of certificates registered by a student
     * @param _studentAddress The student's address
     * @return The count of certificates
     */
    function getStudentCertificateCount(address _studentAddress)
        public
        view
        returns (uint256)
    {
        return studentCertificates[_studentAddress].length;
    }

    /**
     * @dev Emit verification event (for audit trail)
     * @param _certHash The certificate hash being verified
     */
    function logVerification(bytes32 _certHash) public {
        require(isRegistered[_certHash], "Certificate not registered");
        emit CertificateVerified(_certHash, msg.sender, block.timestamp);
    }
}
