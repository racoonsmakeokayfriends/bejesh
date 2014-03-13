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
	// if this tile is partially outside the top boundary
	if (t.position.y+TILE_SIZE < BOARD_BOX_Y0)	{

	}
	// if this tile is totally outside the top boundary
	if (t.position.y <= BOARD_BOX_Y0)	{
		t.position.y = BOARD_BOX_X0;
	}

	// if this tile is partially outside the bottom boundary
	if (t.position.y < BOARD_BOX_Y1)	{

	}
	// if this tile is totally outside the bottom boundary
	if (t.position.y+TILE_SIZE < BOARD_BOX_Y1)	{
		t.position.y = BOARD_BOX_Y0+TILE_SIZE;
	}
}