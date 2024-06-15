//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract ERC4907 is ERC721URIStorage {
    event UpdateUser(
        uint256 indexed tokenId,
        address indexed user,
        uint64 indexed expires
    );
    struct UserInfo {
        address user;
        uint256 expires;
    }

    // mapping of tokenId to rented user
    mapping(uint256 => UserInfo) internal users;

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}

    function setUser(uint256 tokenId, address user, uint64 expires) public virtual{
        require(_isApprovedOrOwner(msg.sender, tokenId),"ERC721: transfer caller is not owner nor approved");
        UserInfo storage info =  users[tokenId];
        info.user = user;
        info.expires = expires;
        emit UpdateUser(tokenId,user,expires);
    }

    function userOf(uint256 tokenId)public view virtual returns(address){
        if( uint256(users[tokenId].expires) >=  block.timestamp){
            return  users[tokenId].user;
        }
        else{
            return address(0);
        }
    }

    function userExpires(uint256 tokenId) public view virtual returns(uint256){
        return users[tokenId].expires;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override{
        super._beforeTokenTransfer(from, to, tokenId);

        if (from != to && users[tokenId].user != address(0)) {
            delete users[tokenId];
            emit UpdateUser(tokenId, address(0), 0);
        }
    }
}
