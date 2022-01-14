// SPDX-License-Identifier: Unlicense OR MIT

pragma solidity ^0.8.4;

//import hardhat console
import "hardhat/console.sol";

contract WavePortal {
    uint256 totalWaves;

    // set a seed to generate the random number
    uint256 private seed;

    // create an event for the portal to emit
    event NewWave(address indexed from, uint256 timestamp, string message);

    // create a struct (custom datatype) to store data like address, timestamp and message
    struct Wave{
        address waver; // address of the user who waved
        string message; // message the user sent
        uint256 timestamp; // timestamp when user waved
    }

    // declare a variable waves that stores the array of waves recieved 
    Wave[] waves;

    // prepare cooldown variable, make it as mapping type
    mapping(address => uint256) public lastWavedAt;

    constructor() payable{
        console.log("I am a Smart Contract!");

        // set the initial seed
        seed = (block.timestamp + block.difficulty) % 100;
    }

    // the core function where we push the wave into the Wave[] array and emit the event

    function wave(string memory _message) public{

        // check if current timestamp greater than 2 mins 
        console.log("Last Waved At: ", lastWavedAt[msg.sender]);
        require(
            lastWavedAt[msg.sender] + 2 minutes < block.timestamp,
            "wait for 2 mins"
        );

        // update current timestamp we have for the user
        lastWavedAt[msg.sender] = block.timestamp;


        totalWaves += 1;
        console.log("%s has waved with the message %s", msg.sender, _message);

        // store the data in the waves array
        waves.push(Wave(msg.sender, _message, block.timestamp));

        // generate a new seed for the next user
        seed = (seed + block.timestamp + block.difficulty) % 100;

        console.log("Random # generated: ", seed);

        // set 50% chances of winning the prize
        if(seed <= 50){
            console.log("%s user wins the prize!", msg.sender);
            // set prize for every message
            uint256 prizeAmount = 0.00001 ether;
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(
                success,
                "Failed to withdraw any money from the contract."
            );
        }

        // emit the event 
        emit NewWave(msg.sender, block.timestamp, _message);


    }

    // function to get all waves data to list on the UI 
    function getAllWaves() public view returns(Wave[] memory){
        return waves;
    }


    // get total wave coount
    function getTotalWaves() public view returns (uint256){
        console.log("We have %d total waves", totalWaves);
        return totalWaves;
    }
}

