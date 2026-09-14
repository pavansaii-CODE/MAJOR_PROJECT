const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateVerification", function () {
  let contract;
  let owner;
  let student1;
  let student2;

  // Sample data
  const sampleHash = ethers.keccak256(ethers.toUtf8Bytes("sample_certificate_content"));
  const sampleIpfsCid = "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX";
  const sampleStudentId = "STU123456";

  beforeEach(async function () {
    // Get signers
    [owner, student1, student2] = await ethers.getSigners();

    // Deploy contract
    const CertificateVerification = await ethers.getContractFactory("CertificateVerification");
    contract = await CertificateVerification.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });
  });

  describe("Certificate Registration", function () {
    it("Should register a new certificate successfully", async function () {
      await expect(
        contract.connect(student1).registerCertificate(
          sampleHash,
          sampleIpfsCid,
          sampleStudentId
        )
      )
        .to.emit(contract, "CertificateRegistered")
        .withArgs(sampleHash, sampleIpfsCid, student1.address, sampleStudentId, await anyValue());

      expect(await contract.isCertificateRegistered(sampleHash)).to.be.true;
    });

    it("Should fail to register duplicate certificate", async function () {
      await contract.connect(student1).registerCertificate(
        sampleHash,
        sampleIpfsCid,
        sampleStudentId
      );

      await expect(
        contract.connect(student2).registerCertificate(
          sampleHash,
          sampleIpfsCid,
          "STU999"
        )
      ).to.be.revertedWith("Certificate already registered");
    });

    it("Should fail with invalid certificate hash", async function () {
      const zeroHash = ethers.ZeroHash;
      await expect(
        contract.connect(student1).registerCertificate(
          zeroHash,
          sampleIpfsCid,
          sampleStudentId
        )
      ).to.be.revertedWith("Invalid certificate hash");
    });

    it("Should fail with empty IPFS CID", async function () {
      await expect(
        contract.connect(student1).registerCertificate(
          sampleHash,
          "",
          sampleStudentId
        )
      ).to.be.revertedWith("IPFS CID required");
    });
  });

  describe("Certificate Verification", function () {
    beforeEach(async function () {
      // Register a certificate first
      await contract.connect(student1).registerCertificate(
        sampleHash,
        sampleIpfsCid,
        sampleStudentId
      );
    });

    it("Should verify an existing certificate", async function () {
      const [exists, record] = await contract.verifyCertificate(sampleHash);

      expect(exists).to.be.true;
      expect(record.certificateHash).to.equal(sampleHash);
      expect(record.ipfsCid).to.equal(sampleIpfsCid);
      expect(record.studentAddress).to.equal(student1.address);
      expect(record.studentId).to.equal(sampleStudentId);
      expect(record.isVerified).to.be.true;
    });

    it("Should return false for non-existent certificate", async function () {
      const randomHash = ethers.keccak256(ethers.toUtf8Bytes("random_content"));
      const [exists] = await contract.verifyCertificate(randomHash);

      expect(exists).to.be.false;
    });

    it("Should get certificate details", async function () {
      const record = await contract.getCertificate(sampleHash);

      expect(record.certificateHash).to.equal(sampleHash);
      expect(record.ipfsCid).to.equal(sampleIpfsCid);
      expect(record.studentAddress).to.equal(student1.address);
    });
  });

  describe("Student Certificates", function () {
    it("Should track multiple certificates for a student", async function () {
      const hash1 = ethers.keccak256(ethers.toUtf8Bytes("cert1"));
      const hash2 = ethers.keccak256(ethers.toUtf8Bytes("cert2"));

      await contract.connect(student1).registerCertificate(hash1, "CID1", "STU123");
      await contract.connect(student1).registerCertificate(hash2, "CID2", "STU123");

      const certs = await contract.getStudentCertificates(student1.address);
      expect(certs.length).to.equal(2);
      expect(certs[0]).to.equal(hash1);
      expect(certs[1]).to.equal(hash2);
    });

    it("Should return correct certificate count", async function () {
      const hash1 = ethers.keccak256(ethers.toUtf8Bytes("cert1"));
      const hash2 = ethers.keccak256(ethers.toUtf8Bytes("cert2"));

      await contract.connect(student1).registerCertificate(hash1, "CID1", "STU123");
      await contract.connect(student1).registerCertificate(hash2, "CID2", "STU123");

      const count = await contract.getStudentCertificateCount(student1.address);
      expect(count).to.equal(2);
    });
  });

  describe("Verification Logging", function () {
    beforeEach(async function () {
      await contract.connect(student1).registerCertificate(
        sampleHash,
        sampleIpfsCid,
        sampleStudentId
      );
    });

    it("Should log verification event", async function () {
      await expect(contract.connect(student2).logVerification(sampleHash))
        .to.emit(contract, "CertificateVerified")
        .withArgs(sampleHash, student2.address, await anyValue());
    });

    it("Should fail to log verification for unregistered certificate", async function () {
      const randomHash = ethers.keccak256(ethers.toUtf8Bytes("random"));
      await expect(
        contract.logVerification(randomHash)
      ).to.be.revertedWith("Certificate not registered");
    });
  });
});

// Helper for timestamp matching
async function anyValue() {
  return true;
}
