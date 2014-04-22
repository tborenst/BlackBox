#Lorem Ipsum Generator
This is a lorem ipsum generator. It takes in two parameters: `words` and `jsonp` (optional).

* `words` is the number of words of lorem ipsum to generater (max = 1000).
* if `jsonp` is specified in the request, the data will be returned in the form of a script 
which will put the result into a global varialbe called `lorem`.

##Example Usage
In order to call this Box, all you have to do is to send a GET request:

	http://blackbox.com/callbox/{box-id}?words=200&jsonp

