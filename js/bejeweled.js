/*********************
 ***** Constants *****
 *********************/
var BOARD_WIDTH = 8;
var BOARD_HEIGHT = 8;
var GAME_WIDTH = 800;
var GAME_HEIGHT = 600;
var NUM_TILES = 5;
var TILE_SIZE = 50;
var MARGIN_X = 100;
var MARGIN_Y = 150;
var MIN_MATCH_NUM = 5;

var BOARD_BOX_X0 = MARGIN_X;
var BOARD_BOX_X1 = MARGIN_X + BOARD_WIDTH*TILE_SIZE;
var BOARD_BOX_Y0 = MARGIN_Y;
var BOARD_BOX_Y1 = MARGIN_Y + BOARD_HEIGHT*TILE_SIZE;

var texture_list = [];
var extra_wrap_tiles = [];

function get_x_pos(c) { return c*TILE_SIZE + MARGIN_X; }
function get_y_pos(r) { return r*TILE_SIZE + MARGIN_Y; }

/************************
 ***** Global State *****
 ************************/
var board = [];
var tiles = [];

var m = new M();
var renderer;
var stage;
var graphics;

/**********************************
 ***** Game Functions [LOGIC] *****
 **********************************/
function move_row(row,delta)	{
	if (delta > 0)	{	// forward shift
		board[row] = m.shift_forward_n(board[row],delta);
		tiles[row] = m.shift_forward_n(tiles[row],delta);
	}
	else	{	// backward shift
		board[row] = m.shift_backward_n(board[row],delta*-1);
		tiles[row] = m.shift_backward_n(tiles[row],delta*-1);
	}

	for (var c=0; c<BOARD_WIDTH; c++)	{
		tiles[row][c].position.x = get_x_pos(c);
		tiles[row][c].dragC0 = c;
	}
}

function move_col(col,delta)	{
	var tempB = [];
	var tempT = [];
	for (var i=0; i<BOARD_HEIGHT; i++)	{
		tempB[i] = board[i][col];
		tempT[i] = tiles[i][col];
	}

	if (delta > 0)	{	// forward shift
		tempB = m.shift_forward_n(tempB,delta);
		tempT = m.shift_forward_n(tempT,delta);
	}
	else	{
		tempB = m.shift_backward_n(tempB,delta*-1);	
		tempT = m.shift_backward_n(tempT,delta*-1);	
	}

	for (var i=0; i<BOARD_HEIGHT; i++)	{
		board[i][col] = tempB[i];
		tiles[i][col] = tempT[i];
	}

	for (var r=0; r<BOARD_HEIGHT; r++)	{
		tiles[r][col].position.y = get_y_pos(r);
		tiles[r][col].dragR0 = r;
	}
}

// NOTE: perhaps combine replace_row + replace_col?
function replace_row(row, a)	{
	// [x] put new tiles in the streak in row row starting at a
	// [x] kill exisiting tiles
	var streak_tile = board[row][a];
	for (var c=a; c<BOARD_WIDTH; c++)	{
		if (streak_tile != board[row][c])	{
			return;
		}
		board[row][c] = Math.floor(Math.random()*NUM_TILES);
		stage.removeChild(tiles[row][c]);
		tiles[row][c] = create_tile(row,c);
	}
}

function replace_col(col, a)	{
	// TODO: put new tiles in the streak in column col starting at a
	var streak_tile = board[a][col];
	for (var r=a; r<BOARD_HEIGHT; r++)	{
		if (streak_tile != board[r][col])	{
			return;
		}
		board[r][col] = Math.floor(Math.random()*NUM_TILES);
		stage.removeChild(tiles[r][col]);
		tiles[r][col] = create_tile(r,col);
	}
}

function num_to_col(num)	{
	colors = ["green", "orange", "blue", "red", "white"];
	return colors[num];
}

function has_match()	{
	// [x] check if there is a winning row (5+)
	// if there is:
	//   [x] replace that row
	//   [ ] score accordingly

	var	streak_count, curr_streak_tile;
	var debug_str;
	// check row
	for (var r=0; r<BOARD_HEIGHT; r++)	{
		streak_count = 1;
		curr_streak_tile = -1;
		for (var c=0; c<BOARD_WIDTH; c++)	{
			if (board[r][c] == curr_streak_tile)	{ 
				streak_count+=1;
				if (streak_count >= MIN_MATCH_NUM)	{
					console.log("we have a winner! [row]");
					replace_row(r,c-streak_count+1);
					break;
				}
			}
			else {
				streak_count = 1;
				curr_streak_tile = board[r][c];
			}			
		}
	}
	
	// check column
	for (var c=0; c<BOARD_WIDTH; c++)	{
		streak_count = 1;
		curr_streak_tile = -1;
		for (var r=0; r<BOARD_HEIGHT; r++)	{
			if (board[r][c] == curr_streak_tile)	{ 
				streak_count+=1;
				if (streak_count >= MIN_MATCH_NUM)	{
					console.log("we have a winner! [column]");
					replace_col(c,r-streak_count+1);
				}
			}
			else {
				streak_count = 1;
				curr_streak_tile = board[r][c];
			}
		}
	}
}

function new_board()	{
	for (var r=0; r<BOARD_HEIGHT; r++)	{
		board[r] = [];
		tiles[r] = [];
		for (var c=0; c<BOARD_WIDTH; c++)	{
			board[r][c] = Math.floor(Math.random()*NUM_TILES);
			tiles[r][c] = create_tile(r,c);
		}
	}
}

/************************************
 ***** Game Functions [DISPLAY] *****
 ************************************/

function init_texture_list()	{
	texture_list[0] = new PIXI.Texture.fromImage("/assets/t1.png");
	texture_list[1] = new PIXI.Texture.fromImage("/assets/t2.png");
	texture_list[2] = new PIXI.Texture.fromImage("/assets/t3.png");
	texture_list[3] = new PIXI.Texture.fromImage("/assets/t4.png");
	texture_list[4] = new PIXI.Texture.fromImage("/assets/t5.png");
}

function init()	{
	init_texture_list();
	for (var i=0; i<NUM_TILES; i++)	{
		extra_wrap_tiles[i] = create_wrap_tile(i);
	}
}

function drag_wrap_n_snap(drag_horizontal, index)	{
	if (drag_horizontal == 1)	{
		///// snapping /////
		// note: if dx is positive, row is moving to the right
		var dx = Math.floor(tiles[index][0].position.x - BOARD_BOX_X0);
		var delta;
		if (dx%TILE_SIZE >= TILE_SIZE/2)	{	delta = Math.ceil(dx/TILE_SIZE);	}
		else {	delta = Math.floor(dx/TILE_SIZE);	}
		move_row(index, delta);
	}
	else if (drag_horizontal == 0)	{
		///// snapping /////
		// note: if dx is positive, row is moving to the right
		var dy = Math.floor(tiles[0][index].position.y - BOARD_BOX_Y0);
		var delta;
		if (dy%TILE_SIZE >= TILE_SIZE/2)	{	delta = Math.ceil(dy/TILE_SIZE);	}
		else {	delta = Math.floor(dy/TILE_SIZE);	}
		move_col(index, delta);
	}
}

function add_wrap_around_x0(tile_type,row)	{

}

function wrapping_row(t)	{
	// if this tile is partially outside the right boundary
	if (t.position.x+TILE_SIZE > BOARD_BOX_X1)	{

	}
	// if this tile is totally outside the right boundary
	if (t.position.x >= BOARD_BOX_X1)	{
		t.position.x = BOARD_BOX_X0;
	}

	// if this tile is partially outside the left boundary
	if (t.position.x < BOARD_BOX_X0)	{

	}
	// if this tile is totally outside the left boundary
	if (t.position.x+TILE_SIZE <= BOARD_BOX_X0)	{
		t.position.x = BOARD_BOX_X1-TILE_SIZE;
	}
}

function wrapping_col(t)	{
	// draw a circle
	graphics.lineStyle(0);
	graphics.beginFill(0xFFFF0B, 1);

	// if this tile is partially outside the top boundary
	if (t.position.y+TILE_SIZE < BOARD_BOX_Y0)	{
		m.log_d("tile is partially outside the top boundary: "+t.num);
		graphics.drawCircle(t.position.x, t.position.y+TILE_SIZE,5);
	}
	// if this tile is totally outside the top boundary
	else if (t.position.y <= BOARD_BOX_Y0)	{
		t.position.y = BOARD_BOX_Y1;
		m.log_d("tile is totally outside the top boundary: "+t.num);
		graphics.drawCircle(t.position.x, t.position.y,5);
	}

	// if this tile is partially outside the bottom boundary
	else if (BOARD_BOX_Y1 < t.position.y)	{
		m.log_d("tile is partially outside the bottom boundary: "+t.num);
		graphics.drawCircle(t.position.x, t.position.y+TILE_SIZE,5);
	}
	// if this tile is totally outside the bottom boundary
	else if (BOARD_BOX_Y1 < t.position.y+TILE_SIZE)	{
		t.position.y = BOARD_BOX_Y0+TILE_SIZE;
		m.log_d("tile is totally outside the bottom boundary: "+t.num);
		graphics.drawCircle(t.position.x, t.position.y,5);
	}
}

function create_tile(r, c)	{
	var tile = new PIXI.Sprite(texture_list[board[r][c]]);
	tile.interactive = true;
	tile.buttonMode = true;
	tile.anchor.x = 0.0;
	tile.anchor.y = 1.0;
	tile.dragR0 = r;
	tile.dragC0 = c;
	tile.num = board[r][c];
	// use the mousedown and touchstart
	tile.mousedown = tile.touchstart = function(data)
	{
		// data.originalEvent.preventDefault()
		// store a refference to the data
		// The reason for this is because of multitouch
		// we want to track the movement of this particular touch
		this.data = data;
		this.alpha = 0.9;
		this.dragging = true;

		this.drag_horizontal = -1; // the direction of the drag isn't set
	};
	
	// set the events for when the mouse is released or a touch is released
	tile.mouseup = tile.mouseupoutside = tile.touchend = tile.touchendoutside = function(data)
	{
		if (this.drag_horizontal==1)	{
			drag_wrap_n_snap(1,tile.dragR0);
			has_match(1);
		}
		else if (this.drag_horizontal==0)	{
			drag_wrap_n_snap(0,tile.dragC0);
			has_match(0);
		}
		this.alpha = 1
		this.dragging = false;
		this.drag_horizontal = -1;
		// set the interaction data to null
		this.data = null;
	};

	// set the callbacks for when the mouse or a touch moves
	tile.mousemove = tile.touchmove = function(data)
	{
		if (this.dragging)	{
			var newPosition = this.data.getLocalPosition(this.parent);
			var t;
			// get the direction of the drag
			if (this.drag_horizontal == -1)	{
				var dx, dy;
				dx = Math.abs(get_x_pos(tile.dragC0) - newPosition.x);
				dy = Math.abs(get_y_pos(tile.dragR0) - newPosition.y);
				if (dx > 15 && dx > dy) {
					this.drag_horizontal = 1;
				}
				else if (dy > 15 && dy > dx)	{
					this.drag_horizontal = 0;
				}
			}

			// move row
			if (this.drag_horizontal == 1) {
				dx = newPosition.x - this.position.x;
				for (var i=0; i<BOARD_WIDTH; i++)	{
					t = tiles[tile.dragR0][i];
					//wrapping_row(t);
					t.position.x += dx;
				}
			}

			// move column
			if (this.drag_horizontal == 0) {
				dy = newPosition.y - this.position.y;
				for (var i=0; i<BOARD_HEIGHT; i++)	{
					t = tiles[i][tile.dragC0];
					//wrapping_col(t);
					t.position.y += dy;
				}
			}
		}		
	}

	tile.position.x = get_x_pos(tile.dragC0);
	tile.position.y = get_y_pos(tile.dragR0);

	stage.addChild(tile);
	return tile;
}

function create_wrap_tile(n)	{
	var tile = new PIXI.Sprite(texture_list[n]);
	tile.anchor.x = 0.0;
	tile.anchor.y = 1.0;
	tile.position.x = 0;
	tile.position.y = 0;
	tile.num = n;
	return tile;
}

/**********************************
 ***** Game Functions [INPUT] *****
 **********************************/
$(document).ready(function()	{

	init();

	stage = new PIXI.Stage(0x000000,true);
	graphics = new PIXI.Graphics();
	renderer = PIXI.autoDetectRenderer(GAME_WIDTH, GAME_HEIGHT, null);
	document.body.appendChild(renderer.view);

	new_board();

	requestAnimFrame(animate);

	function animate() {
    requestAnimFrame(animate);  
    renderer.render(stage);
	}

	// // TESTING move_row visuals
	// $(document).click(function()	{
	// 	move_row(0,3);
	// 	display_board();
	// });

});

// $(document).ready(function()	{
// 	// create an new instance of a pixi stage
// 	var stage = new PIXI.Stage(0x97c56e, true);
// 	// create a renderer instance
// 	var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, null);
	
// 	// add the renderer view element to the DOM
// 	document.body.appendChild(renderer.view);
// 	renderer.view.style.position = "absolute";
// 	renderer.view.style.top = "0px";
// 	renderer.view.style.left = "0px";
// 	requestAnimFrame( animate );
	
// 	// create a texture from an image path
// 	var texture = PIXI.Texture.fromImage("assets/t1.png");
	
// 	for (var i=0; i < 10; i++) 
// 	{
// 		createBunny(Math.random() * window.innerWidth, Math.random() * window.innerHeight)
// 	};
	
	
// 	function createBunny(x, y)
// 	{
// 		// create our little bunny friend..
// 		var bunny = new PIXI.Sprite(texture);
// 		//	bunny.width = 300;
// 		// enable the bunny to be interactive.. this will allow it to respond to mouse and touch events		
// 		bunny.interactive = true;
// 		// this button mode will mean the hand cursor appears when you rollover the bunny with your mouse
// 		bunny.buttonMode = true;
		
// 		// center the bunnys anchor point
// 		bunny.anchor.x = 0.5;
// 		bunny.anchor.y = 0.5;
// 		// make it a bit bigger, so its easier to touch
// 		bunny.scale.x = bunny.scale.y = 3;
		
// 		// use the mousedown and touchstart
// 		bunny.mousedown = bunny.touchstart = function(data)
// 		{
// 	//		data.originalEvent.preventDefault()
// 			// store a refference to the data
// 			// The reason for this is because of multitouch
// 			// we want to track the movement of this particular touch
// 			this.data = data;
// 			this.alpha = 0.9;
// 			this.dragging = true;
// 		};
		
// 		// set the events for when the mouse is released or a touch is released
// 		bunny.mouseup = bunny.mouseupoutside = bunny.touchend = bunny.touchendoutside = function(data)
// 		{
// 			this.alpha = 1
// 			this.dragging = false;
// 			// set the interaction data to null
// 			this.data = null;
// 		};
		
// 		// set the callbacks for when the mouse or a touch moves
// 		bunny.mousemove = bunny.touchmove = function(data)
// 		{
// 			if(this.dragging)
// 			{
// 				// need to get parent coords..
// 				var newPosition = this.data.getLocalPosition(this.parent);
// 				this.position.x = newPosition.x;
// 				this.position.y = newPosition.y;
// 			}
// 		}
		
// 		// move the sprite to its designated position
// 		bunny.position.x = x;
// 		bunny.position.y = y;
		
// 		// add it to the stage
// 		stage.addChild(bunny);
// 	}
	
// 	function animate() {
	
// 	    requestAnimFrame( animate );
	
// 	    // just for fun, lets rotate mr rabbit a little
// 		//stage.interactionManager.update();
// 	    // render the stage   
// 	    renderer.render(stage);
// 	}
// });


/*****************
 ***** TO DO *****
 *****************
	{ } User Input
			{ } show drag wrapping
	{ } Game
			{x} implement find_win()
			{x} implement replacing tiles
			{ } implement basic scoring --> will be expanded
	{ } Tests
			{s} test changing board width/height
			{ } test changing tile size
			{ } test changing margins
	{ } ERRORS
			{x} after clicking and dragging a couple rows/columns
					when selecting new row/column, a different line is being moved
					- after moving one tile in horizontally, I can't move it vertically
			{ } sometimes drag selection is finicky --> displaying wrapping might help

 */
