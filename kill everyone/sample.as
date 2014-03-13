package {
  import flash.display.Sprite;
  import flash.events.MouseEvent;
  import flash.events.Event;
  import flash.text.TextField;
  
  public class bejewelled extends Sprite {
    private var gems_array:Array=new Array();
    private var aGem:Sprite;
    private var selectorBox:Sprite=new Sprite();
    private var selectorRow:int=-10;
    private var selectorColumn:int=-10;
    private var red:uint = 0xFF0000;
    private var green:uint = 0xFF00;
    private var blue:uint = 0xFF;
    private var yellow:uint = 0xFFFF00;
    private var cyan:uint = 0xFFFF;
    private var magenta:uint = 0xFF00FF;
    private var white:uint = 0xFFFFFF;
    private var colours_array:Array=new Array(red,green,blue,yellow,cyan,magenta,white);
    private var clickPossible:Boolean=false;
    private var score_txt:TextField=new TextField();
    private var hint_txt:TextField=new TextField();
    private var score:uint=0;
    private var inaRow:uint=0;
    private var match:Boolean = true;
      
    public function bejewelled() {
      // Game initiation
      // Create and style score text
      addChild(score_txt);
      score_txt.textColor=0xFFFFFF;
      score_txt.x=500;
      // Create and style hint text
      addChild(hint_txt);
      hint_txt.textColor=0xFFFFFF;
      hint_txt.x=550;
      // Create Gems in rows and columns
      for (var i:uint=0; i<8; i++) {
        gems_array[i]=new Array();
        for (var j:uint=0; j<8; j++) {
          do {
            gems_array[i][j]=Math.floor(Math.random()*7);
          }
            while (rowLineLength(i,j)>2 || columnLineLength(i,j)>2);
          aGem=new Sprite();
          aGem.graphics.beginFill(colours_array[gems_array[i][j]]);
          aGem.graphics.drawCircle(30,30,29);
          aGem.graphics.endFill();
          aGem.name=i+"_"+j;
          aGem.x=j*60;
          aGem.y=i*60;
          addChild(aGem);
        }
      }
      // Create and style selector box
      addChild(selectorBox);
      selectorBox.graphics.lineStyle(2,red,1);
      selectorBox.graphics.drawRect(0,0,60,60);
      selectorBox.visible=false;
      // Listen for user input
      stage.addEventListener(MouseEvent.CLICK,onClick);
      
      addEventListener(Event.ENTER_FRAME,everyFrame);
    }
      
    // Every frame...
    private function everyFrame(e:Event):void {
      //Assume that gems are not falling
      var gemsAreFalling:Boolean=false;
      // Check each gem for space below it
      for (var i:int=6; i>=0; i--) {
        for (var j:uint=0; j<8; j++) {
          // If a spot contains a gem, and has an empty space below...
          if (gems_array[i][j] != -1 && gems_array[i+1][j]==-1) {
            // Set gems falling
            gemsAreFalling=true;
            gems_array[i+1][j]=gems_array[i][j];
            gems_array[i][j]=-1;
            getChildByName(i+"_"+j).y+=60;
            getChildByName(i+"_"+j).name=(i+1)+"_"+j;
            break;
          }
        }
        // If a gem is falling
        if (gemsAreFalling) {
          // don't allow any more to start falling
          break;
        }
      }
      // If no gems are falling
      if (! gemsAreFalling) {
        // Assume no new gems are needed
        var needNewGem:Boolean=false;
        // but check all spaces...
        for (i=7; i>=0; i--) {
          for (j=0; j<8; j++) {
            // and if a spot is empty
            if (gems_array[i][j]==-1) {
              // now we know we need a new gem
              needNewGem=true;
              // pick a random color for the gem
              gems_array[0][j]=Math.floor(Math.random()*7);
              // create the gem
              aGem=new Sprite();
              aGem.graphics.beginFill(colours_array[gems_array[0][j]]);
              aGem.graphics.drawCircle(30,30,29);
              aGem.graphics.endFill();
              // ID it
              aGem.name="0_"+j;
              // position it
              aGem.x=j*60;
              aGem.y=0;
              // show it
              addChild(aGem);
              // stop creating new gems
              break;
            }
          }
          // if a new gem was created, stop checking
          if (needNewGem) {
            break;
          }
        }
        // If no new gems were needed...
        if (! needNewGem) {
          // assume no more/new lines are on the board
          var moreLinesAvailable:Boolean=false;
          // check all gems
          for (i=7; i>=0; i--) {
            for (j=0; j<8; j++) {
              // if a line is found
              if (rowLineLength(i,j)>2 || columnLineLength(i,j)>2) {
                // then we know more lines are available
                moreLinesAvailable=true;
                // creat a new array, set the gem type of the line, and where it is
                var lineGems:Array=[i+"_"+j];
                var gemType:uint=gems_array[i][j];
                var linePosition:int;
                // check t's a horizontal line...
                if (rowLineLength(i,j)>2) {
                  // if so, find our how long it is and put all the line's gems into the array
                  linePosition=j;
                  while (sameGemIsHere(gemType,i,linePosition-1)) {
                    linePosition--;
                    lineGems.push(i+"_"+linePosition);
                  }
                  linePosition=j;
                  while (sameGemIsHere(gemType,i,linePosition+1)) {
                    linePosition++;
                    lineGems.push(i+"_"+linePosition);
                  }
                }
                // check t's a vertical line...
                if (columnLineLength(i,j)>2) {
                  // if so, find our how long it is and put all the line's gems into the array
                  linePosition=i;
                  while (sameGemIsHere(gemType,linePosition-1,j)) {
                    linePosition--;
                    lineGems.push(linePosition+"_"+j);
                  }
                  linePosition=i;
                  while (sameGemIsHere(gemType,linePosition+1,j)) {
                    linePosition++;
                    lineGems.push(linePosition+"_"+j);
                  }
                }
                // for all gems in the line...
                for (i=0; i<lineGems.length; i++) {
                  // remove it from the program
                  removeChild(getChildByName(lineGems[i]));
                  // find where it was in the array
                  var cd:Array=lineGems[i].split("_");
                  // set it to an empty gem space
                  gems_array[cd[0]][cd[1]]=-1;
                  // set the new score
                  score+=inaRow;
                  // set the score setter up
                  inaRow++;
                }
                // if a row was made, stop the loop
                break;
              }
            }
            // if a line was made, stop making more lines
            if (moreLinesAvailable) {
              break;  
            }
          }
          // if no more lines were available...
          if (! moreLinesAvailable) {
            // allow new moves to be made
            clickPossible=true;
            // remove score multiplier
            inaRow=0;
          }
        }
      }
      // display new score
      score_txt.text=score.toString();
    }
    // When the user clicks
    private function onClick(e:MouseEvent):void {
      // If a click is allowed
      if (clickPossible) {
        // If the click is within the game area...
        if (mouseX<480&&mouseX>0&&mouseY<480&&mouseY>0) {
          // Find which row and column were clicked
          var clickedRow:uint=Math.floor(mouseY/60);
          var clickedColumn:uint=Math.floor(mouseX/60);
          // Check if the clicked gem is adjacent to the selector
          // If not...
          if (!(((clickedRow==selectorRow+1 || clickedRow==selectorRow-1)&&clickedColumn==selectorColumn)||((clickedColumn==selectorColumn+1 || clickedColumn==selectorColumn-1) && clickedRow==selectorRow))) {
            // Find row and colum the selector should move to
            selectorRow=clickedRow;
            selectorColumn=clickedColumn;
            // Move it to the chosen position
            selectorBox.x=60*selectorColumn;
            selectorBox.y=60*selectorRow;
            // If hidden, show it.
            selectorBox.visible=true;
          }
          // If it is not next to it...
          else {
            // Swap the gems;
            swapGems(selectorRow,selectorColumn,clickedRow,clickedColumn);
            // If they make a line...
            if (rowLineLength(selectorRow,selectorColumn)>2 || columnLineLength(selectorRow,selectorColumn)>2||rowLineLength(clickedRow,clickedColumn)>2 || columnLineLength(clickedRow,clickedColumn)>2) {
              // remove the hint text
              hint_txt.text="";
              // dis-allow a new move until cascade has ended (removes glitches)
              clickPossible=false;
              // move and rename the gems
              getChildByName(selectorRow+"_"+selectorColumn).x=clickedColumn*60;
              getChildByName(selectorRow+"_"+selectorColumn).y=clickedRow*60;
              getChildByName(selectorRow+"_"+selectorColumn).name="t";
              getChildByName(clickedRow+"_"+clickedColumn).x=selectorColumn*60;
              getChildByName(clickedRow+"_"+clickedColumn).y=selectorRow*60;
              getChildByName(clickedRow+"_"+clickedColumn).name=selectorRow+"_"+selectorColumn;
              getChildByName("t").name=clickedRow+"_"+clickedColumn;
              match = true;
            }
            // If not...
            else {
              // Switch them back
              swapGems(selectorRow,selectorColumn,clickedRow,clickedColumn);
              match = false;
            }
            if (match) {
              // Move the selector position to default
              selectorRow=-10;
              selectorColumn=-10;
              // and hide it
              selectorBox.visible=false;
            }
            else {
              // Set the selector position
              selectorRow=clickedRow;
              selectorColumn=clickedColumn;
              // Move the box into position
              selectorBox.x=60*selectorColumn;
              selectorBox.y=60*selectorRow;
              match = false;
              // If hidden, show it.
              selectorBox.visible=true;
            }
          }
        }
        // If the click is outside the game area
        else {
          // For gems in all rows...
          for (var i:uint=0; i<8; i++) {
            // and columns...
            for (var j:uint=0; j<8; j++) {
              // if they're not too close to the side... 
              if (i<7) {
                // swap them horizontally
                swapGems(i,j,i+1,j);
                // check if they form a line
                if ((rowLineLength(i,j)>2||columnLineLength(i,j)>2||rowLineLength(i+1,j)>2||columnLineLength(i+1,j)>2)) {
                  // if so, name the move made
                  selectorBox.x = j*60;
                  selectorBox.y = i*60;
                  selectorBox.visible = true;
                  hint_txt.text = (i+1).toString()+","+(j+1).toString()+"->"+(i+2).toString()+","+(j+1).toString();
                }
                // swap the gems back
                swapGems(i,j,i+1,j);
              }
              // then if they're not to close to the bottom...
              if (j<7) {
                // swap it vertically
                swapGems(i,j,i,j+1);
                // check if it forms a line
                if ((rowLineLength(i,j)>2||columnLineLength(i,j)>2||rowLineLength(i,j+1)>2||columnLineLength(i,j+1)>2) ) {
                  // if so, name it
                  selectorBox.x = j*60;
                  selectorBox.y = i*60;
                  selectorBox.visible = true;
                  hint_txt.text = (i+1).toString()+","+(j+1).toString()+"->"+(i+1).toString()+","+(j+2).toString();
                }
                // swap the gems back
                swapGems(i,j,i,j+1);
              }
            }
          }
        }
      }
    }
    //Swap given gems
    private function swapGems(fromRow:uint,fromColumn:uint,toRow:uint,toColumn:uint):void {
      //Save the original position
      var originalPosition:uint=gems_array[fromRow][fromColumn];
      //Move original gem to new position
      gems_array[fromRow][fromColumn]=gems_array[toRow][toColumn];
      //move second gem to saved, original gem's position
      gems_array[toRow][toColumn]=originalPosition;
    }
    //Find out if there is a horizontal line
    private function rowLineLength(row:uint,column:uint):uint {
      var gemType:uint=gems_array[row][column];
      var lineLength:uint=1;
      var checkColumn:int=column;
      //check how far left it extends
      while (sameGemIsHere(gemType,row,checkColumn-1)) {
        checkColumn--;
        lineLength++;
      }
      checkColumn=column;
      //check how far right it extends
      while (sameGemIsHere(gemType,row,checkColumn+1)) {
        checkColumn++;
        lineLength++;
      }
      // return total line length
      return (lineLength);
    }
    //Find out if there is a vertical line
    private function columnLineLength(row:uint,column:uint):uint {
      var gemType:uint=gems_array[row][column];
      var lineLength:uint=1;
      var checkRow:int=row;
      //check how low it extends
      while (sameGemIsHere(gemType,checkRow-1,column)) {
        checkRow--;
        lineLength++;
      }
      //check how high it extends
      checkRow=row;
      while (sameGemIsHere(gemType,checkRow+1,column)) {
        checkRow++;
        lineLength++;
      }
      // return total line length
      return (lineLength);
    }
    private function sameGemIsHere(gemType:uint,row:int,column:int):Boolean {
      //Check there are gems in the chosen row
      if (gems_array[row]==null) {
        return false;
      }
      //If there are, check if there is a gem in the chosen slot
      if (gems_array[row][column]==null) {
        return false;
      }
      //If there is, check if it's the same as the chosen gem type
      return gemType==gems_array[row][column];
    }
  }
}










/***************
 ** Constants **
 ***************/

var BOARD_WIDTH = 5;
var BOARD_HEIGHT = 6;
var GAME_WIDTH = 800;
var GAME_HEIGHT = 600;



/**********************
 ** Function Helpers **
 **********************/

function pick_from_list(list) {
  var i = Math.floor(Math.random()*(list.length-1)+1);
  return list[i];
}



/*************
 ** Globals **
 *************/

var board = []
var images;


/***********************
 ** Bejeweled Helpers **
 ***********************/

function swap_tile(from_row, from_col, to_row, to_col)  {
  // swap these gems!
}

function new_tile(r,c)  {
  board[r][c] = Math.floor(Math.random()*(list.length-1)+1);
}

function draw_board() {
  var game_board = game.add.group();
  for (var r=0; r<BOARD_HEIGHT; r++)  {
    for (var c=0; c<BOARD_WIDTH; c++) {
      var tempSprite = game_board.create(c*50+100, r*50+100, images[board[r][c]]);
      tempSprite.inputEnabled = true;
      tempSprite.input.enableDrag(false, true);
    }
  }
}

/**********************
 ** Phaser Functions **
 **********************/
var game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, 'game_div', { preload:preload, create:create, render:render, update:update });

function preload()  {
  game.load.image('tile1', 'assets/t1.png');
  game.load.image('tile2', 'assets/t2.png');
  game.load.image('tile3', 'assets/t3.png');
  game.load.image('tile4', 'assets/t4.png');
  game.load.image('tile5', 'assets/t5.png');
}

function create() {
  //  This returns an array of all the image keys in the cache
  images = game.cache.getImageKeys();

  for (var r = 0; r < BOARD_HEIGHT; r++)  { 
    board[r] = [];
    for (var c = 0; c < BOARD_WIDTH; c++) {
      var i = Math.floor(Math.random()*(images.length-1)+1);      
      board[r][c] = i;
    }
  }
}

function render () {

  //game.debug.renderInputInfo(32, 32);
  draw_board();
}

function update() {
/*
  // assume no tiles are falling
  var tiles_falling = false;
  // check each tile for space below it
  for (var r=0; r<BOARD_HEIGHT; r++)  {
    for (var c=0; c<BOARD_WIDTH; c++) {
      if (board[r][c] != -1 && board[r+1][c] == -1) {
        // tiles are falling now
        tiles_falling = true;
        board[r+1][c] = board[r][c];
        board[r][c] = -1;
        // update graphics?
      }
    }
    // if tiles are falling, let no more fall
    if (tiles_falling)  {
      break;
    }
  }
  if (!tiles_falling) {
    var need_new_tile = false; // assume you don't need a new tile
    // check all spaces
    for (var r=BOARD_HEIGHT-1; r<0; r--)  {
      for (var c=0; c<BOARD_WIDTH; c++) {
        if (board[r][c] == -1)  {
          // we need a new tile
          need_new_tile = true;
          new_tile(r,c);
          break;
        }
      }
      if (need_new_tile)  {
        break;
      }
    }
    if (!need_new_tile) {
      var more_lines_available = false;
      for (var r=BOARD_HEIGHT-1; r<0; r--)  {
        for (var c=0; c<BOARD_WIDTH; c++) {

        }
      }
    }
  }
*/
  
}


/*
green - #588C73
yellow - #F2E394
orange - #F2AE72
red - #D96459
deep read - #8C4646
*/

/*
pink - F43F42
blue - 0EA1BF
orange - FCA72F
green - 5AA754
white - FBFFDA
*/