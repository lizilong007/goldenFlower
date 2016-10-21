// 聊天室开发
var mime = require( './mime')
var http = require( 'http' ).createServer( mime.serverStatic );
var io = require( 'socket.io' ).listen( http );

var userData = require( './count_user' );
var proFunc = require( './pro' );

var PORT = 4000;

http.listen( PORT );

//缓存对象
var data = userData.userData;
var pro = proFunc.pro;


io.sockets.on( 'connection', function( socket ) {

    //随机为用户设置一个昵称
    data.userList.push( data.getRandomName() );
    socket.emit( 'yourName', data.userList[data.userList.length-1] );

    if ( !data.isStart && data.userList.length > 2 ) {
        //比赛未开始，则开赛,确保参赛人员大于两个人
       start( socket );
    }

	console.log( 'one comming...' );

	socket.on( 'giveUp', function( obj ) {
        if ( !data.isStart )
            return;

        //当前用户放弃了，寻找前一个用户
        if ( obj.id === data.current.nextId ) {
            data.current.nextId = pro.getPrev( data.currentList , obj.id );
        }

        //将该用户从当前还在坚持的列表中移除
        pro.removeItem( data.currentList, obj.id );
        pro.removeItem( data.cards, obj.id );

        //向当前的用户传递他已经弃牌的信息
        socket.emit( 'youGiveUp' );


        // console.log(data.currentList );
        judgeIsEnd( socket );

        console.log( 'one give up his brand!And his nick name is ' + obj.id +
                     ', His cards is ' + obj['cards'] );
	});

    // 加倍的消息
    socket.on( 'double', function( obj ) {
        if ( !data.isStart )
            return;
        if ( data.current.price !== 16 ) {
            data.current.price *= 2;
        }else {
            data.current.price = 16;
        }
        data.current.total += data.current.price;

        judgeIsEnd( socket );
    });


    // 跟上的消息
    socket.on( 'goOn', function( obj ) {
        if ( !data.isStart )
            return;
        data.current.total += data.current.price;

        judgeIsEnd( socket );
    });

    socket.on( 'compareResult', function( obj ) {
        if ( !data.isStart )
            return;
        data.current.total += data.current.price;

        console.log( obj.loserName + ' lose!' );
        if ( obj.loserName === data.current.nextId ) {
            data.current.nextId = pro.getPrev( data.currentList , obj.loserName );
        }

        //将该用户从当前还在坚持的列表中移除
        pro.removeItem( data.currentList, obj.loserName );
        pro.removeItem( data.cards, obj.loserName );

        socket.broadcast.emit( 'getResult', 
                    {loserName:obj.loserName, winnerName:obj.winnerName} 
                );

        console.log( 'The left users is ' , data.currentList );
        judgeIsEnd( socket );
    });


	socket.on( 'disconnect', function() {
		console.log( 'one disconnect from this network!' );
        //广播给所有在线者，让他们返回自己的id，用来判断是哪一位离开了
        socket.broadcast.emit( 'someOneLeft', 'Please send your id to me.' );
	});

    // 响应当某一个用户离开的时候，各个用户返回自己的名字
    socket.on( 'someOneLeftResponse', function( content ) {
        pro.filterLeftUser( data, content );
    })

    // 先不登录了，直接采用随机数即可
    /*socket.on( 'login', function( data ) {
        console.log( 'One user login!' );
        data = data.trim();
        userData.userData.userList.push( data );
    })*/
});

function judgeIsEnd( socket ) {
    if ( pro.isEnd( data.currentList ) ) {
        //将上一次赢的人赋值给lastWinner
        data.lastWinner = data.currentList[0];

        data.isStart = false;

        socket.emit( 'someoneWin', data.currentList[0] );
        socket.broadcast.emit( 'someoneWin', data.currentList[0] );

        //10秒之后重新开始游戏
        setTimeout( function(){
            start( socket );
        }, 4000 );
    }else {
        var next = pro.getNextId( data.currentList, data.current.nextId );
        data.current.nextId = next;

        socket.emit( 'cardOrder', next );
        socket.broadcast.emit( 'cardOrder', next );
    }

    socket.emit( 'currentInfo', data.current );
    socket.broadcast.emit( 'currentInfo', data.current );
}

function start( socket ) {
    pro.shuffle( userData );
    // 返回各个玩家得到的牌
    socket.emit( 'start', data.cards );
    socket.broadcast.emit( 'start', data.cards );

    var next = data.currentList[0];
    data.current.nextId = next;

    socket.emit( 'cardOrder', next );
    socket.broadcast.emit( 'cardOrder', next );

    socket.emit( 'currentInfo', data.current );
    socket.broadcast.emit( 'currentInfo', data.current );
}
