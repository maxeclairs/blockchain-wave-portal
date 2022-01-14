const main = async () => {

    const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
    const waveContract = await waveContractFactory.deploy({
        value: hre.ethers.utils.parseEther("0.1"),
    });
    await waveContract.deployed();
    console.log("Contract Address: ", waveContract.address);
    // console.log("Contract Deployed by: ", owner.address)

    // get contract balance
    let contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log("Contract Balance: ", hre.ethers.utils.formatEther(contractBalance));

    // let's try sending two waves to check if we get the prize

    const waveTxn = await waveContract.wave("This is wave 1");
    await waveTxn.wait();

    const waveTxn2 = await waveContract.wave("This is wave 2");
    await waveTxn2.wait();


    // let waveCount;
    // waveCount = await waveContract.getTotalWaves();
    // console.log(waveCount.toNumber());


    // // let's send a wave
    // let waveTxn = await waveContract.wave("A message!");
    // await waveTxn.wait(); //wait for the transaction to be mined

    // get contract balance after wave
    contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log("Contract Balance: ", hre.ethers.utils.formatEther(contractBalance));

    // const [owner, randomPerson] = await hre.ethers.getSigners();
    // waveTxn = await waveContract.connect(randomPerson).wave("Another Message!");
    // await waveTxn.wait(); // wait for the transaction to be mined

    let allWaves = await waveContract.getAllWaves();
    console.log(allWaves);

};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

runMain();