pragma solidity ^0.5.2;

/**
 * @title ClaimsRegistry
 * @dev This is based on the ERC-780 Ethereum Claims Registry (https://github.com/ethereum/EIPs/issues/780)
 * This implementation adds an ability to approve certain claims of fulfilled IDA promises by an additional entity in the most minimal form.
 * One claim could require multiple approvals.
 */
contract ClaimsRegistry {

    mapping(address => mapping(address => mapping(bytes32 => bytes32))) public registry;

    /**
     * @dev An event that is emitted every time a claim is submitted by a service provider
     * @param issuer  the service provider that is submitting the claim
     * @param subject  the address of the IDA contract that is managing this type of impact promise
     * @param key  a unique identifier (code) for an instance of impact promise
     * @param value  an amount of money that is being unlocked when the impact promise is validated
     * @param updatedAt  the timestamp when a claim was submitted
     */
    event ClaimSet(
        address indexed issuer,
        address indexed subject,
        bytes32 indexed key,
        bytes32 value,
        uint updatedAt);


    /**
     * @dev An event that is emitted every time a claim is validated by a nominated validator
     * @param approver  the Validator that verifies and signs off on the proof that an impact promise has been fulfilled
     * @param issuer  the service provider that is submitting the claim
     * @param subject  the address of the IDA contract that is managing this type of impact
     * @param key  a unique identifier (code) for an instance of impact promise
     * @param value  an amount of money that is being unlocked when the impact promise is validated
     * @param approvedAt  the timestamp when a claim was approved
     */
    event ClaimApproved(
        address approver,
        address indexed issuer,
        address indexed subject,
        bytes32 indexed key,
        bytes32 value,
        uint approvedAt);


    /**
     * @dev An event that is emitted when a service provider decides to withdraw claim and cancel the validation procedure
     * @param issuer  the service provider that is submitting the claim
     * @param subject  the address of the IDA contract that is managing this type of impact
     * @param key  a unique identifier (code) for an instance of impact promise
     * @param removedAt  the timestamp when a claim was removed
     */
    event ClaimRemoved(
        address indexed issuer,
        address indexed subject,
        bytes32 indexed key,
        uint removedAt);


    /**
     * @dev A method that allows a service provider (msg.sender) to submit a claim with the following params:
     *
     * @param subject  the address of the IDA contract that is managing this type of impact
     * @param key  a unique identifier (code) for an instance of impact promise
     * @param value  the price of a claim
     */
    function setClaim(address subject, bytes32 key, bytes32 value) public {
        registry[msg.sender][subject][key] = value;
        emit ClaimSet(msg.sender, subject, key, value, now);
    }


    /**
     * @dev A method to remove an existing claim. It could be used by a service provider to revoke a claim made
     *      by mistake or one that is not ready to be validated.
     *
     * @param subject  the address of the IDA contract that is managing this type of impact
     * @param key  a unique identifier (code) for an instance of impact promise
     */
    function removeClaim(address subject, bytes32 key) public {
      require(getClaim(msg.sender, subject, key) != bytes32(0), "Claim with given subject and key doesn't exist");
      delete registry[msg.sender][subject][key];

      emit ClaimRemoved(msg.sender, subject, key, now);
    }


    /**
     * @dev A method to validate an existing claim.
     *
     * @param subject  the address of the IDA contract that is managing this type of impact
     * @param key  a unique identifier (code) for an instance of impact promise
     */
    function approveClaim(address issuer, address subject, bytes32 key) public {
        bytes32 value = getClaim(issuer, subject, key);
        require(value != bytes32(0), "Claim with given subject and key doesn't exist");

        registry[msg.sender][subject][key] = value;
        emit ClaimApproved(msg.sender, issuer, subject, key, value, now);
    }


    /**
     * @dev Returns all of the details of the claim specified.
     */
    function getClaim(address issuer, address subject, bytes32 key) public view returns(bytes32) {
      return registry[issuer][subject][key];
    }


    /**
     * @dev Returns true if a claim with given subject and key was issued by the provided issuer
     *      and validated by the provided approver.
     */
    function isApproved(address approver, address issuer, address subject, bytes32 key) public view returns(bool) {
        return registry[issuer][subject][key] == registry[approver][subject][key];
    }
}
