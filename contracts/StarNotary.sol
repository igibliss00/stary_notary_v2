pragma solidity >=0.4.24;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract StarNotary is ERC721 {
    struct Star {
        string name;
        bool isExist;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    constructor() public ERC721("Star", "STR") {}

    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public {
        Star memory newStar = Star({name: _name, isExist: true});
        tokenIdToStarInfo[_tokenId] = newStar;
        _mint(msg.sender, _tokenId);
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(
            ownerOf(_tokenId) == msg.sender,
            "You can't sale the Star you don't owned"
        );
        starsForSale[_tokenId] = _price;
    }

    function _make_payable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "You need to have enough Ether");
        transferFrom(ownerAddress, msg.sender, _tokenId);
        address payable ownerAddressPayable = _make_payable(ownerAddress);
        ownerAddressPayable.transfer(starCost);
        if (msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    function lookUpTokenIdToStarInfo(uint256 _tokenId)
        public
        view
        returns (string memory)
    {
        // checking to see if the star exists
        require(tokenIdToStarInfo[_tokenId].isExist, "No such star exists");
        return tokenIdToStarInfo[_tokenId].name;
    }

    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        // checking to see if the first star exists
        require(
            tokenIdToStarInfo[_tokenId1].isExist,
            "The first star doesn't exists"
        );

        // checking to see if the second star exists
        require(
            tokenIdToStarInfo[_tokenId2].isExist,
            "The second star doesn't exists"
        );

        // check the ownership of the stars
        require(
            ownerOf(_tokenId1) == msg.sender ||
                ownerOf(_tokenId2) == msg.sender,
            "Sender does not own either of the tokens"
        );

        address ownerAddress1 = ownerOf(_tokenId1);
        address ownerAddress2 = ownerOf(_tokenId2);

        // change of ownership of the first star
        _transfer(ownerAddress1, ownerAddress2, _tokenId1);

        // change of ownership of the second star
        _transfer(ownerAddress2, ownerAddress1, _tokenId2);
    }

    function transferAStar(uint256 _tokenId, address recipient) public {
        // checking to see if the star exists
        require(tokenIdToStarInfo[_tokenId].isExist, "The star doesn't exists");

        // check the ownership
        require(ownerOf(_tokenId) == msg.sender, "You do not own the star");

        transferFrom(msg.sender, recipient, _tokenId);
    }
}
