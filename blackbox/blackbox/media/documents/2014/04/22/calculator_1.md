#Simple Calculator
This calculator is very simple and supports four operations on two numbers:

* addition `add`
* subtraction `sub`
* multipication `mul`
* division `div`

##Usage
In the GET request to this box, include parameters `num1`, `num2`, and `op`. For example:

	http://www.blackbox.com/callbox/{{box-id}}?num1=3&num2=4&op=sub

The response will be, of course, `-1`.