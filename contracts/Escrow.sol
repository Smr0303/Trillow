//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

error NotSeller();
error LessAmountSent();
error NotBuyer();
error NotInspector();

contract Escrow {
   address payable public seller;
   address public lender;
   address public inspector;
   address public nftAddress;


   mapping(uint256 => bool) public isListed;
   mapping(uint256=>uint256) public purchasePrice;
   mapping(uint256=>uint256) public escrowAmount;
   mapping(uint256=>address) public buyer;
   mapping(uint256=>bool) public inspectionPassed;
   mapping(uint256=>mapping(address => bool)) public approval;

   constructor (  address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender){
    seller = payable(_seller);
    lender = _lender;
    inspector = _inspector;
    nftAddress = _nftAddress; 
   }


 modifier onlySeller (){
    if (msg.sender != seller){
        revert NotSeller();
    }
   _;

 }
     modifier onlyBuyer (uint256 _nftID){
    if (msg.sender != buyer[_nftID]){
        revert NotBuyer();
    }
   _;
     }
  modifier onlyInspector (){
    if (msg.sender != inspector){
        revert NotInspector();
    }
   _;
     }

   function list(uint256 _nftID, address _buyer, uint256 _purchasePrice, uint256 _escrowAmount) public onlySeller {
    //Transferring token ownership 
    IERC721(nftAddress).transferFrom(msg.sender, address(this),_nftID);
   //updated mapping
    isListed[_nftID] = true;
    buyer[1] = _buyer;
    purchasePrice[1] = _purchasePrice;
    escrowAmount[1] = _escrowAmount;
   }

   function depositEarnest(uint256 _nftID) public payable onlyBuyer(_nftID){
     if(msg.value < escrowAmount[_nftID]){
        revert LessAmountSent();
     }
   }

  function updateInspectionStatus(uint256 _nftID) public onlyInspector {
    inspectionPassed[_nftID] = true;
  }

  function approveSale(uint256 _nftID) public  {
    approval[_nftID][msg.sender] = true;
  }

function finalizeSale(uint256 _nftID) public {
require(inspectionPassed[_nftID] == true);
require(approval[_nftID][buyer[_nftID]] == true);
require(approval[_nftID][seller] == true);
require(approval[_nftID][lender] == true);

require(address(this).balance >= purchasePrice[_nftID]);
//transferred the funds
(bool success,)= payable(seller).call{value: address(this).balance}("");
require(success);
//Transferred the nft
IERC721(nftAddress).transferFrom(address(this), buyer[_nftID],_nftID);
}

function cancelSale(uint256 _nftID) public {
    if(inspectionPassed[_nftID] == false){
        payable(buyer[_nftID]).transfer(address(this).balance);
    }
    else{
        payable(seller).transfer(address(this).balance);
    }
}

 receive() external payable{}

function getBalance() public view returns(uint256) {
 return address(this).balance;
}
}
