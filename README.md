## What is this?

Spotd (pronounced Spotted) is a tool to help extract signature blocks from an emails. 

The input email is assumed to be in a plain text format.

If you have emails in an EML/MIME/HTML formats you should first clean them up and extract the email's text before feeding it to this tool.

## How to use?

Install by running this command: 

    npm install --save spotd

Then use it like this:

```js
var spotd = require("spotd");
let email = `
Hello,

This is a sample email to test spotd library. It should detect this email's signature.

Give attitude scratch at fleas, meow until belly rubs, hide behind curtain when vacuum
cleaner is on scratch strangers and poo on owners food for vommit food and eat it again
kitten is playing with dead mouse scratch leg.

Regards,

Harry POTTER
Software Wizard
Hogwarts School of Witchcraft and Wizardry
+44 6 45 56 67 78
harry.potter@hogwarts.com
http://github.com

This text is not part of the signature and should get ignored.

`; 

let signature = spotd.extract(email);

/* Outputs:


Harry POTTER
Software Wizard
Microsoft
harry.potter@gmail.com
http://github.com
+44 6 45 56 67 78
*/
```

You can also place email examples in folder `test/src` and run them through this library to output signatures in folder ``test/dest`.
For this, just place your files in src folder and run

    npm run transform

## How does this work?

`Spotd` works in a two-step process:

1. For each line of text try to detect presence or absence of a feature
2. Given a line of text and its features, decide if this line is a part of a signature or not.
   + For now the decision is made be mapping each feature to a score (number)
   + The target is to let a machine learning process to make the decision by itself


Below is the list of features used:

| Feature Name          	| Description                                        	|
|-----------------------	|----------------------------------------------------	|
| EMPTY_LINE            	| Is it empty                                        	|
| PHONE                 	| Does it contain a phone number                     	|
| EMAIL                 	| Does it contain an email address                   	|
| LINK                  	| Does it contain a link                             	|
| LONG_LINE             	| Is it a long line (>60 chars)                      	|
| FULL_NAME             	| Does it contain a name of a person?                	|
| SENTENCE              	| Is it a regular sentence?                          	|
| NO_STOP_WORDS         	| Does it contain stop words?                        	|
| CAPITAL_CASE          	| Is it capital case?                                	|
| DOUBLE_DASH           	| Does it start with double dash signature delimiter 	|
| ENDS_WITH_PUNCTUATION 	| Does it end with a punctuation?                    	|


## Supported languages

- French
- English
