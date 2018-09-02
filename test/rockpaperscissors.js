var RockPaperScissors = artifacts.require("./RockPaperScissors.sol");

contract('RockPaperScissors', function(accounts) {

    var owner = accounts[0];
    var player1 = accounts[1];
    var player2 = accounts[2];
    var player3 = accounts[3];
    var minWage = web3.toWei(0.5,"ether");
    var contract;

    beforeEach( function(){
        console.log("inside beforeEach");
        return RockPaperScissors.new(minWage, {from: owner})
        .then( function(instance){
            contract = instance;

            contract.Log( function(err, result) {
                if(err){
                    console.log("error occurred", err);
                    return error(err);
                }
                console.log("Event emitted: " + result.args.log);
            });
        });
    });

    it("contract should initialize with correct minWage", function() {
        console.log("inside testcase1");
        return contract.minWage({from: owner})
        .then( function(_minWage){
            assert.equal(_minWage, minWage, "minWage is not initialized correctly");
        })
    });

    it("player1 enters with a wager", function(){
        var player1Wager = web3.toWei(0.6,"ether");
        return contract.enter(1, true, {from: player1, value: player1Wager})
        .then( function(_txn){
            console.log("transaction: ", _txn);
            return contract.getRegisteredPlayers()
            .then ( function(players){
                console.log("returned players: ", players);
                var playerFound = false;
                if(players[0] == player1){
                    playerFound = true;
                } else if(players[1] == player1){
                    playerFound = true;
                }

                assert.equal(playerFound, true, "Player1 is not entered into the game");
            })
        })
    });

    it("both players enters with a wager", function(){
        var player1Wager = web3.toWei(0.6,"ether");
        var player2Wager = web3.toWei(0.7,"ether");

        return contract.enter(1, true, {from: player1, value:player1Wager})
        .then( function(_txn){
            return contract.getRegisteredPlayers()
            .then( function(_players){
                assert.equal(_players[0], player1);
                return contract.enter(2, true, {from: player2, value:player2Wager})
                .then( function(_txn){
                    return contract.getRegisteredPlayers()
                    .then( function(_players){
                        assert.equal(_players[1], player2);
                    })
                })
            })
        })
    });

    var playGame = function(player1, player2, player1Move, player2Move, player1Wager, player2Wager, winningPlayerNumber) {

        var player1BalanceBeforePlay;
        var player2BalanceBeforePlay;

        var player1BalanceAfterPlay;
        var player2BalanceAfterPlay;

        return contract.enter(player1Move, true, {from: player1, value:player1Wager})
        .then( function(_txn){
            return contract.getRegisteredPlayers()
            .then( function(_players){
                assert.equal(_players[0], player1);
                return contract.enter(player2Move, true, {from: player2, value:player2Wager})
                .then( function(_txn){
                    return contract.getRegisteredPlayers()
                    .then( function(_players){
                        assert.equal(_players[1], player2);
                        player1BalanceBeforePlay = web3.fromWei(web3.eth.getBalance(player1).toNumber(),"ether");
                        player2BalanceBeforePlay = web3.fromWei(web3.eth.getBalance(player2).toNumber(),"ether");

                        console.log("player1BalanceBeforePlay: ", player1BalanceBeforePlay);
                        console.log("player2BalanceBeforePlay: ", player2BalanceBeforePlay);
                        return contract.play({from: owner})
                        .then( function(_txn){
                            console.log("transaction after playing: ", _txn);
                            player1BalanceAfterPlay = web3.fromWei(web3.eth.getBalance(player1).toNumber(),"ether");
                            player2BalanceAfterPlay = web3.fromWei(web3.eth.getBalance(player2).toNumber(),"ether");    

                            console.log("player1BalanceAfterPlay: ", player1BalanceAfterPlay);
                            console.log("player2BalanceAfterPlay: ", player2BalanceAfterPlay);  
                            //since Player2 is winner - player2 balance should be more than his balance before 
                            
                            console.log("difference in Player1 after play:", (player1BalanceAfterPlay - player1BalanceBeforePlay));
                            console.log("difference in Player2 after play:", (player2BalanceAfterPlay - player2BalanceBeforePlay));
                            // assert( (player2BalanceAfterPlay - player2BalanceBeforePlay)>0, "Player2 actually did not win" );
                            if(winningPlayerNumber === 1) {
                                assert( (player1BalanceAfterPlay - player1BalanceBeforePlay)>0, "Player1 actually did not win" );
                            } else {
                                assert( (player2BalanceAfterPlay - player2BalanceBeforePlay)>0, "Player2 actually did not win" );
                            }
                        })
                    })
                })
            })
        })

    }

    it("start the play with Player1 - Rock and Player2 - Paper", function(){
        var player1Wager = web3.toWei(0.6,"ether");
        var player2Wager = web3.toWei(0.7,"ether");
        
        //With Rock and Paper -> winner is Paper => Player 2
        playGame(player1, player2, 1, 2, player1Wager, player2Wager, 2);
    });

    it("start the play with Player1 - Paper and Player2 - Scissors", function(){
        var player1Wager = web3.toWei(0.6,"ether");
        var player2Wager = web3.toWei(0.7,"ether");
        
        //With Paper and Scissors -> winner is Scissors => Player 2
        playGame(player1, player2, 2, 3, player1Wager, player2Wager, 2);
    });    

    it("start the play with Player1 - Rock and Player2 - Scissors", function(){
        var player1Wager = web3.toWei(0.6,"ether");
        var player2Wager = web3.toWei(0.7,"ether");
        
        //With Rock and Scissors -> winner is Rock => Player 1
        playGame(player1, player2, 1, 3, player1Wager, player2Wager, 1);
    });    

    it("start the play with Player1 - Paper and Player2 - Rock", function(){
        var player1Wager = web3.toWei(0.6,"ether");
        var player2Wager = web3.toWei(0.7,"ether");
        
        //With Paper and Rock -> winner is Paper => Player 1
        playGame(player1, player2, 2, 1, player1Wager, player2Wager, 1);
    });    

    it("start the play with Player1 - Scissors and Player2 - Paper", function(){
        var player1Wager = web3.toWei(0.6,"ether");
        var player2Wager = web3.toWei(0.7,"ether");
        
        //With Scissors and Paper -> winner is Scissors => Player 1
        playGame(player1, player2, 3, 2, player1Wager, player2Wager, 1);
    }); 
    
    it("start the play with Player1 - Scissors and Player2 - Rock", function(){
        var player1Wager = web3.toWei(0.6,"ether");
        var player2Wager = web3.toWei(0.7,"ether");
        
        //With Scissors and Rock -> winner is Rock => Player 2
        playGame(player1, player2, 3, 1, player1Wager, player2Wager, 2);
    });  
    
    it("Player enters with wager less than minWage", function(){
        var player1Wager = web3.toWei(0.4,"ether");
        return contract.enter(1, true, {from: player1, value: player1Wager})
        .then( function(_txn){
            console.log("txn: ", _txn);
            assert(false, "Should not have come here");
        }, function(e) {
            // console.log("Inside error function", e);
            assert.match(e, /VM Exception while processing transaction: revert/, "Invalid error");
        }
        );
    });

    it("Player 3 tries to enter while Player1 and Player2 are playing", function(){
        var player1Wager = web3.toWei(0.6,"ether");
        var player2Wager = web3.toWei(0.7,"ether");
        var player3Wager = web3.toWei(0.6,"ether");

        return contract.enter(1, true, {from: player1, value:player1Wager})
        .then( function(_txn){
            return contract.getRegisteredPlayers()
            .then( function(_players){
                assert.equal(_players[0], player1);
                return contract.enter(2, true, {from: player2, value:player2Wager})
                .then( function(_txn){
                    return contract.getRegisteredPlayers()
                    .then( function(_players){
                        assert.equal(_players[1], player2);
                    })
                    .then( function(){
                        //Now Player3 tries to enter
                        return contract.enter(2, true, {from: player3, value:player3Wager})
                        .then( function(_txn){
                            assert(false, "should not have come here");
                        }, function(e) {
                            assert.match(e, /VM Exception while processing transaction: revert/, "Invalid error");
                        }
                        )
                    })
                })
            })
        })

    })
    

});

