app = (() => {
    const SENTINEL = 10; // 盤面の境界を判定するための値。
    const BOARD_SIZE = 14; // 盤面のサイズ。
    const BOMB = BOARD_SIZE; // 祠の数。

    var bomb_board = null; // 祠がある位置の管理用変数。
    var play_board = null; // 盤面のプレイ状態を管理する変数。

    // 「祠を透視する」の表示・非表示切り替えを行う。
    debug = () => {
        let debug = document.getElementById('debug');
        if (document.getElementById('enable_debug').checked == true) {
            debug.style.visibility = 'visible';
            debug.style.display = 'block';
        } else {
            debug.style.visibility = 'hidden';
            debug.style.display = 'none';
        }
    }

    // 盤面のボタンを無効化する。
    // ゲームクリア/ゲームオーバーのいずれの場合からもこの関数が呼ばれ、true/falseで
    // 処理を分岐させる。
    disable_board = (is_clear) => {
        for (var i = 1; i < BOARD_SIZE-1; i++) {
            for (var j = 1; j < BOARD_SIZE-1; j++) {
                const id = `${i}:${j}`;
                if (bomb_board[j][i] == '祠') {
                    if (is_clear == true) {
                        document.getElementById(id).innerHTML = '<font color="green">祠</font>';
                    } else {
                        document.getElementById(id).innerHTML = '<font color="red">祠</font>';
                    }
                }
                if (bomb_board[j][i] != '祠' && document.getElementById(id).innerText == '祠') {
                    document.getElementById(id).innerHTML = '<font color="red">×</font>';
                }
                document.getElementById(id).disabled = true;
            }
        }
    }

    // 盤面のチェックを行い、ゲームクリア状態であるかどうか判定する。
    check_answer = () => {
        let count = 0;
        for (var i = 1; i < BOARD_SIZE-1; i++) {
            for (var j = 1; j < BOARD_SIZE-1; j++) {
                const id = `${i}:${j}`;
                if (bomb_board[j][i] != '祠' && document.getElementById(id).disabled == true) {
                    count++;
                }
            }
        }

        let all_board = (BOARD_SIZE - 2) ** 2;

        // 以下の条件を満たした場合はゲームクリアとする。
        //   全盤面の個数 - チェックを入れた祠(orまだ開けていない祠) = 祠の数
        if ((all_board - count) == BOMB) {
            disable_board(true);
            setTimeout(() => {
                document.getElementById('reset').disabled = false;
                alert("ゲームクリア：\n\n┏━━━━┓\n┃えらいっ┃\n┗━━━━┛");
            }, 100);
        }
    }

    // 「祠を透視する」のDOM(HTML)を生成する。
    debug_show = () => {
        var html = '';
        html = '<table border="0">';
        for (var i = 1; i < BOARD_SIZE-1; i++) {
            html += '<tr>';
            for (var j = 1; j < BOARD_SIZE-1; j++) {
                html += `<td><button disabled="true">${bomb_board[i][j]}</button></td>`;
            }
            html += '</tr>';
        }
        html += '</table>';
        document.getElementById('bomb_debug').innerHTML = html;
    }

    // 盤面のDOM(HTML)を生成する。
    generate_board = () => {
        var html = '';
        html = '<table border="0">';
        for (var i = 1; i < BOARD_SIZE-1; i++) {
            html += '<tr>';
            for (var j = 1; j < BOARD_SIZE-1; j++) {
                if (play_board[i][j] == '') {
                    html += `<td><button id="${j}:${i}" onClick="app.open_board(${j},${i})" oncontextmenu="return app.toggle_flag(${j},${i});">　</button></td>`;
                }
            }
            html += '</tr>';
        }
        html += '</table>';
        document.getElementById('board').innerHTML = html;
    }

    // 「祠」のチェックを付けたり外したりする。
    toggle_flag = (x, y) => {
        var id = `${x}:${y}`;

        document.getElementById('reset').disabled = true;

        var flag = document.getElementById(id).innerText;
        if (flag == '　') {
            document.getElementById(id).innerText = '祠';
        } else if (flag == '祠') {
            document.getElementById(id).innerText = '　';
        }
        return false;
    }

    // クリックされた盤面を開く。
    open_board = (x, y) => {
        var id = `${x}:${y}`;

        document.getElementById('reset').disabled = true;

        if (x == 0 || x == (BOARD_SIZE - 1)
            || y == 0 || y == (BOARD_SIZE - 1)) 
        {
            return;
        }  
        if (document.getElementById(id).disabled == true) {
            return;
        }

        // 開いた盤面が「祠」ならゲームオーバー。
        if (bomb_board[y][x] == '祠') {
            disable_board(false);
            setTimeout(() => {
                document.getElementById('reset').disabled = false;
                const textarea = document.getElementById('msg').value.split("\n");
                alert(textarea[~~(Math.random() * textarea.length)]);
            }, 400);
            return;
        }

        // 周囲8つの盤面をチェックする。
        //   [-1,-1][ 0,-1][+1,-1]
        //   [-1, 0]   *   [+1, 0]
        //   [-1,+1][ 0,+1][+1,+1]
        var sum = (bomb_board[y-1][x-1] == '祠' ? 1 : 0) +
            (bomb_board[y  ][x-1] == '祠' ? 1 : 0) +
            (bomb_board[y+1][x-1] == '祠' ? 1 : 0) +
            (bomb_board[y-1][x  ] == '祠' ? 1 : 0) +
            0 +
            (bomb_board[y+1][x  ] == '祠' ? 1 : 0) +
            (bomb_board[y-1][x+1] == '祠' ? 1 : 0) +
            (bomb_board[y  ][x+1] == '祠' ? 1 : 0) +
            (bomb_board[y+1][x+1] == '祠' ? 1 : 0);

        // 周囲に「祠」が存在しない場合は、祠が見つかるまで盤面を再帰的に開いてゆく。
        if (sum == 0) {
            document.getElementById(id).innerText = '　';
            document.getElementById(id).disabled = true;

            // [-1,-1][ 0,-1][+1,-1]
            // [-1, 0]   *   [+1, 0]
            // [-1,+1][ 0,+1][+1,+1]
            open_board(x-1, y-1); open_board(x, y-1); open_board(x+1, y-1);
            open_board(x-1, y  );                     open_board(x+1, y);
            open_board(x-1, y+1); open_board(x, y+1); open_board(x+1, y+1);
        } else {
            document.getElementById(id).innerText = sum;
            document.getElementById(id).disabled = true;
        }

        check_answer();
    }

    // データ構造の初期化。
    init = () => {
        bomb_board = new Array(BOARD_SIZE);
        play_board = new Array(BOARD_SIZE);

        for (let i = 0; i < BOARD_SIZE; i++) {
            bomb_board[i] = new Array(BOARD_SIZE);
            play_board[i] = new Array(BOARD_SIZE);
        }

        for (var i = 0; i < BOARD_SIZE; i++) {
            for (var j = 0; j < BOARD_SIZE; j++) {
                bomb_board[i][j] = '　';
                play_board[i][j] = '';
            }
        }

        for (var i = 0; i < BOARD_SIZE; i++) {
            bomb_board[i][0] = SENTINEL;
            bomb_board[i][BOARD_SIZE-1] = SENTINEL;
        }
        for (var j = 0; j < BOARD_SIZE; j++) {
            bomb_board[0][j] = SENTINEL;
            bomb_board[BOARD_SIZE-1][j] = SENTINEL;
        }

        // 盤面に爆弾を配置する
        for (var i = 0; i < BOARD_SIZE; i++) {
            var x = ~~(Math.random() * 12) + 1;
            var y = ~~(Math.random() * 12) + 1;
            bomb_board[x][y] = '祠';
        }

        // 確認用に爆弾の盤面を表示する
        debug_show();

        // 盤面を生成する
        generate_board();
    }

    init();
    debug();

    return {
        'init': init,
        'open_board': open_board,
        'toggle_flag': toggle_flag,
        'debug': debug,
    };
})();

