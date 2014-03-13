M = function() {
	
};
 
M.prototype = {
 
    pick_random: function (list) {
        return list[Math.floor(Math.random()*list.length)];
    },

    shift_forward_n: function (list, n)	{
	    // take a list and push its elements forward by n
	    // the n elements at the end will wrap around
	    // ex: shift_forward_n([1,2,3,4,5,6],2) = [5,6,1,2,3,4]
	    // [0,1,2,3,4] ==> [3,4,0,1,2]
    	var len = list.length;
        var new_list = [];
    	n = n % len;
    	if (n==len)	{
    		return list;
    	}    	
		new_list = new_list.concat(list.slice(len-n,len));
		new_list = new_list.concat(list.slice(0,len-n));    
    	return new_list;
    },

    shift_backward_n: function (list, n)	{
	    // take a list and push its elements forward by n
	    // the n elements at the end will wrap around
	    // ex: shift_backward_n([1,2,3,4,5,6],2) = [3,4,5,6,1,2]
    	var len = list.length;
        var new_list = [];
    	n = n % len;
    	if (n==len)	{
    		return list;
    	}  
    	new_list = new_list.concat(list.slice(n,len));  	
		new_list = new_list.concat(list.slice(0,n));		    
    	return new_list;
    },

    print_matrix: function (matrix)	{
    	// todo: check matrix is indeed 2d matrix
    	for (var i=0; i<matrix.length; i++)	{
    		console.log(matrix[i]);
    	}
    },

    round_to_nearest: function(x,n) {
        var remainder = Math.abs(x) % n;
        if (remainder >= 0.5*n)  {
            return Math.floor(x/n)*n + n;
        }
        return Math.floor(x/n)*n;
    },

    log_d: function(msg)    {
        console.log("[DEBUG]: "+msg);
    }
 
};