import { expect } from "chai";
import { ethers, upgrades, defender } from "hardhat";
import { MyTokenNonUpgradeable, MyTokenUpgradeable, MyTokenUpgradeable_v2, MyTokenUpgradeable_v2__factory, MyTokenUUPS, MyTokenUUPS__factory, MyTokenUUPS_v2 } from "../typechain-types";
import { Contract } from "ethers";

describe("MyToken", function () {
  it("Test contract - native deploy", async function () {
    const ContractFactory = await ethers.getContractFactory("MyTokenNonUpgradeable");

    const initialOwner = (await ethers.getSigners())[0].address;

    const instance: MyTokenNonUpgradeable = await ContractFactory.deploy(initialOwner);
    await instance.waitForDeployment();

    expect(await instance.name()).to.equal("MyToken");
  });

  it("Test contract - deployContract", async function () {
    const ContractFactory = await ethers.getContractFactory("MyTokenNonUpgradeable");

    const initialOwner = (await ethers.getSigners())[0].address;

    const instance: MyTokenNonUpgradeable = await defender.deployContract(ContractFactory, [initialOwner]); // Needs Defender API key in hardhat.config.ts
    await instance.waitForDeployment();

    expect(await instance.name()).to.equal("MyToken");
  });

  it("Test contract - UUPS", async function () {
    const ContractFactory = await ethers.getContractFactory("MyTokenUUPS");

    const initialOwner = (await ethers.getSigners())[0].address;

    const instance: MyTokenUUPS = await upgrades.deployProxy(ContractFactory, [initialOwner], { kind: "uups" });
    await instance.waitForDeployment();

    expect(await instance.name()).to.equal("MyToken");

    // Perform upgrade
    const ContractFactoryV2 = await ethers.getContractFactory("MyTokenUUPS_v2");
    const upgraded: MyTokenUUPS_v2 = await upgrades.upgradeProxy(instance, ContractFactoryV2);
    await upgraded.waitForDeployment();
    expect(await upgraded.version()).to.equal("2");
  });

  it("Test contract - Transparent", async function () {
    const ContractFactory = await ethers.getContractFactory("MyTokenUpgradeable");

    const initialOwner = (await ethers.getSigners())[0].address;

    const instance: MyTokenUpgradeable = await upgrades.deployProxy(ContractFactory, [initialOwner], { kind: "transparent" });
    await instance.waitForDeployment();

    expect(await instance.name()).to.equal("MyToken");

    // Perform upgrade
    const ContractFactoryV2 = await ethers.getContractFactory("MyTokenUpgradeable_v2");
    const upgraded: MyTokenUpgradeable_v2 = await upgrades.upgradeProxy(instance, ContractFactoryV2);
    await upgraded.waitForDeployment();
    expect(await upgraded.version()).to.equal("2");
  });

  it("Test contract - Beacon", async function () {
    const ContractFactory = await ethers.getContractFactory("MyTokenUpgradeable");

    const initialOwner = (await ethers.getSigners())[0].address;

    const beacon = await upgrades.deployBeacon(ContractFactory); // UpgradeableBeacon, not implementation's type
    const beaconProxy: MyTokenUpgradeable = await upgrades.deployBeaconProxy(beacon, ContractFactory, [initialOwner]);
    await beaconProxy.waitForDeployment();

    expect(await beaconProxy.name()).to.equal("MyToken");

    // Perform upgrade
    const ContractFactoryV2 = await ethers.getContractFactory("MyTokenUpgradeable_v2");
    const upgradedBeacon = await upgrades.upgradeBeacon(beacon, ContractFactoryV2); // UpgradeableBeacon, not implementation's type
    await upgradedBeacon.waitForDeployment();

    // Connect to beacon proxy using typechain
    const upgradedInstance: MyTokenUpgradeable_v2 = MyTokenUpgradeable_v2__factory.connect(await beaconProxy.getAddress(), (await ethers.getSigners())[0]);
    expect(await upgradedInstance.version()).to.equal("2");
  });

  it("Test contract - Import UUPS", async function () {
    const ContractFactory = await ethers.getContractFactory("MyTokenUUPS");

    const initialOwner = (await ethers.getSigners())[0].address;
    const instance: MyTokenUUPS = await upgrades.deployProxy(ContractFactory, [initialOwner], { kind: "uups" });
    await instance.waitForDeployment();

    const imported: Contract = await upgrades.forceImport(await instance.getAddress(), ContractFactory); // Not strongly typed for now
    expect(await imported.name()).to.equal("MyToken");
  });

  it("Test contract - Import Transparent", async function () {
    const ContractFactory = await ethers.getContractFactory("MyTokenUpgradeable");

    const initialOwner = (await ethers.getSigners())[0].address;

    const instance: MyTokenUpgradeable = await upgrades.deployProxy(ContractFactory, [initialOwner], { kind: "transparent" });
    await instance.waitForDeployment();

    const imported: Contract = await upgrades.forceImport(await instance.getAddress(), ContractFactory); // Not strongly typed for now
    expect(await imported.name()).to.equal("MyToken");
  });

  it("Test contract - Import Beacon", async function () {
    const ContractFactory = await ethers.getContractFactory("MyTokenUpgradeable");

    const initialOwner = (await ethers.getSigners())[0].address;

    const beacon = await upgrades.deployBeacon(ContractFactory); // UpgradeableBeacon, not implementation's type


    const imported: Contract = await upgrades.forceImport(await beacon.getAddress(), ContractFactory); // Not strongly typed for now
    const beaconProxy: MyTokenUpgradeable = await upgrades.deployBeaconProxy(imported, ContractFactory, [initialOwner]);
    await beaconProxy.waitForDeployment();
    expect (await beaconProxy.name()).to.equal("MyToken");
  });

  it("Test contract - Import Beacon Proxy", async function () {
    const ContractFactory = await ethers.getContractFactory("MyTokenUpgradeable");

    const initialOwner = (await ethers.getSigners())[0].address;

    const beacon = await upgrades.deployBeacon(ContractFactory); // UpgradeableBeacon, not implementation's type
    const beaconProxy: MyTokenUpgradeable = await upgrades.deployBeaconProxy(beacon, ContractFactory, [initialOwner]);
    await beaconProxy.waitForDeployment();  

    const imported: Contract = await upgrades.forceImport(await beaconProxy.getAddress(), ContractFactory); // Not strongly typed for now
    expect(await imported.name()).to.equal("MyToken");
  });

  it("Test contract - Import implementation and use it directly (even though you shouldn't)", async function () {
    const ContractFactory_v2 = await ethers.getContractFactory("MyTokenUpgradeable_v2");

    const instance: MyTokenNonUpgradeable = await ContractFactory_v2.deploy();
    await instance.waitForDeployment();

    const imported: Contract = await upgrades.forceImport(await instance.getAddress(), ContractFactory_v2); // Not strongly typed for now
    expect(await imported.version()).to.equal("2");
  });
});
