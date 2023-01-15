//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

contract Escrow {
   address payable seller;
   address public lender;
   address public inspector;
   address public nftAddress;

   constructor (address _nftAddress, address _lender, address _inspector, address _seller){
    seller = payable(_seller);
    lender = _lender;
    inspector = _inspector;
    nftAddress = _nftAddress; 
   }
}
