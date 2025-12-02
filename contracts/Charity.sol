// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Charity {
    address public admin;
    uint256 public projectCounter;

    struct Project {
        uint256 id;
        address payable charityAddress;
        string title;
        uint256 goalAmount;
        uint256 amountRaised;
        uint256 milestoneCount;
        uint256 currentMilestone;
        mapping(uint256 => string) milestoneProofs; // IPFS hash
    }

    mapping(uint256 => Project) public projects;

    event DonationReceived(
        uint256 indexed projectId,
        address indexed donor,
        uint256 amount
    );
    event MilestoneVerified(
        uint256 indexed projectId,
        uint256 milestoneIndex,
        string proofHash
    );
    event FundsReleased(
        uint256 indexed projectId,
        address charity,
        uint256 amount
    );

    constructor() {
        admin = msg.sender;
    }

    function createProject(
        address payable _charity,
        string memory _title,
        uint256 _goal,
        uint256 _milestones
    ) public {
        projectCounter++;
        Project storage project = projects[projectCounter];
        project.id = projectCounter;
        project.charityAddress = _charity;
        project.title = _title;
        project.goalAmount = _goal;
        project.milestoneCount = _milestones;
        project.currentMilestone = 0;
        project.amountRaised = 0;
    }

    function donate(uint256 _projectId) public payable {
        Project storage project = projects[_projectId];
        require(msg.value > 0, "Donation must be > 0");

        project.amountRaised += msg.value;
        emit DonationReceived(_projectId, msg.sender, msg.value);
    }

    function submitMilestoneProof(
        uint256 _projectId,
        string memory _ipfsHash
    ) public {
        Project storage project = projects[_projectId];
        require(
            project.currentMilestone < project.milestoneCount,
            "All milestones complete"
        );
        project.milestoneProofs[project.currentMilestone] = _ipfsHash;
    }

    function verifyMilestone(uint256 _projectId) public {
        require(msg.sender == admin, "Only admin can verify");
        Project storage project = projects[_projectId];

        require(
            bytes(project.milestoneProofs[project.currentMilestone]).length > 0,
            "No proof submitted"
        );

        uint256 paymentAmount = (project.goalAmount / project.milestoneCount);

        if (project.amountRaised < paymentAmount) {
            revert("Not enough funds raised to release this milestone payment");
        }

        (bool success, ) = project.charityAddress.call{value: paymentAmount}(
            ""
        );
        require(success, "Fund transfer failed");

        emit MilestoneVerified(
            _projectId,
            project.currentMilestone,
            project.milestoneProofs[project.currentMilestone]
        );
        emit FundsReleased(_projectId, project.charityAddress, paymentAmount);

        project.amountRaised -= paymentAmount;
        project.currentMilestone++;
    }

    function getProject(
        uint256 _projectId
    ) public view returns (string memory, uint256, uint256, uint256, uint256) {
        Project storage project = projects[_projectId];
        return (
            project.title,
            project.goalAmount,
            project.amountRaised,
            project.currentMilestone,
            project.milestoneCount
        );
    }
}
