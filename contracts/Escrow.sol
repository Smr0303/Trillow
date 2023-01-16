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

contract Escrow {
   address payable public seller;
   address public lender;
   address public inspector;
   address public nftAddress;


   mapping(uint256 => bool) public isListed;
   mapping(uint256=>uint256) public purchasePrice;
   mapping(uint256=>uint256) public escrowAmount;
   mapping(uint256=>address) public buyer;

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

 receive() external payable{}

function getBalance() public view returns(uint256) {
 return address(this).balance;
}
}
