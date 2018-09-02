pragma solidity ^0.4.6;

contract RockPaperScissors {

    address owner;
    address[] public players = new address[](2);
    uint public minWage;
    uint txFee;

    enum GameState {WaitForPlayers, ReadyForGame}

    struct Playerdata {
        uint wager;
        uint move;
        bool payoutAfterWin;
    }
    mapping(address=>Playerdata) playerWager;


    GameState gameState;

    event Log(string log);

    constructor(uint _minWage) public {
        uint gasBefore = gasleft();
        require(_minWage>0,"Minimum wager must be non zero");
        minWage = _minWage;
        owner = msg.sender;
        gameState = GameState.WaitForPlayers;
        uint gasAfter = gasleft();
        txFee = (gasBefore - gasAfter)*2;
    }

    function enter(uint move, bool _payoutAfterWin) public payable returns (bool succes) {
        emit Log("Inside enter function");
        require(msg.value>minWage, "Player's wager must be greater than minimum wage");
        require(isValidMove(move), "Player's move is not valid");

        address player = msg.sender;
        //when players didnt join
        if(gameState == GameState.WaitForPlayers) {
            if(players[0] == address(0)){
                if(!isValidPlayer(msg.sender, players[1])){
                    revert("You cannot be both the players");
                }
                players[0] = player;
            } else if(players[1] == address(0x0)){
                if(!isValidPlayer(players[0], msg.sender)){
                    revert("You cannot be both the players");
                }
                players[1] = player;
            } else {
                revert("already players are playing");
            }
            //take the wager from the player and transfer to this contract
            //address(this).transfer(msg.value);
            Playerdata memory data = Playerdata(msg.value, move, _payoutAfterWin);
            // data.wager = msg.value;
            // data.move = move;
            // data.payoutAfterWin = _payoutAfterWin;
            playerWager[player] = data;
        } else {
            //Players have already joined and decided to continue the game
            if(players[0] == msg.sender || players[1] == msg.sender) {
                updatePlayerWager(msg.sender, msg.value, move, _payoutAfterWin);
            } else {
                revert("already players are playing");
            }
        }

        if(players[0] != address(0x0) && players[1] != address(0x0)){
            gameState = GameState.ReadyForGame;
        }

        return true;
    }

    function play() public payable returns (bool success){
        require((gameState == GameState.ReadyForGame), "Game is not ready to be played - probably waiting for players to join");
        //1->Rock , 2->Paper, 3->Scissors
        //we shall follow the above conventions for deciding the winner
        // combination -> winner
        // 1,2 || 2,1-> 2
        // 1,3 || 3,1 -> 1
        // 2,3 || 3,2 -> 3
        // 1,1 ; 2,2 ; 3,3 -> contract gets the bounty
        require(msg.sender == owner, "only owner can start the play and decide the winner");
        Playerdata memory player1 = playerWager[players[0]];
        Playerdata memory player2 = playerWager[players[1]];
        if( (player1.move == player2.move ) ) {
            //contract gets the bounty
            return true;
         } else if ( (player1.move == 1 && player2.move == 2) ||
                    (player1.move == 2 && player2.move == 1)
                ){
            //whoever with 2 is the winner
            determineWinnerAndPay(2, player1, player2);
        } else if ( (player1.move == 1 && player2.move == 3) ||
                    (player1.move == 3 && player2.move == 1)
                ){
            //whoever with 1 is the winner
            determineWinnerAndPay(1, player1, player2);
        } else if ( (player1.move == 2 && player2.move == 3) ||
                    (player1.move == 3 && player2.move == 2)
                ){
            //whoever with 3 is the winner
            determineWinnerAndPay(3, player1, player2);
        }
        return true;
    }

    function isValidMove(uint move) private pure returns (bool isValid) {
        if(move == 1 || move == 2 || move == 3) {
            return true;
        }
        return false;
    } 

    function isValidPlayer(address player1, address player2) private pure returns (bool isValid) {
        if(player1 == player2){
            return false;
        }
        return true;
    } 

    function updatePlayerWager(address player, uint amount, uint move, bool _payoutAfterWin) private  {
        address(this).transfer(amount);
        playerWager[player].wager = amount;
        playerWager[player].move = move;    
        playerWager[player].payoutAfterWin = _payoutAfterWin;
    }

    function determineWinnerAndPay(uint winningMove, Playerdata player1, Playerdata player2) private {
        if(player1.move == winningMove) {
            if(player1.payoutAfterWin){
                players[0].transfer(player1.wager + player2.wager);
            }
        } else {
            if(player2.payoutAfterWin){
                players[1].transfer(player1.wager + player2.wager);
            }
        }
    }

    function getRegisteredPlayers() public view returns ( address[] _players) {
        return players;
    }
}