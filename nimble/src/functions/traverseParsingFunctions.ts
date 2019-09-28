import { Position, WorkspaceEdit, ExtensionContext, commands, window, ViewColumn, Uri, workspace } from 'vscode';
import { URI } from 'vscode-uri';
import dynamicImportFunc  from "./dynamicImportFunctions";
const esprima = require('esprima');
const path = require('path');





/*
//traver through the user's workspace and convert static import statements into dynamic imports
originalEntry = path + /src/client/index.js
entryPath = path, but mutates 
*/
export default function traverseUserWorkspace (originalEntry: string, entryPath: string) {
    console.log('orig path(param)', originalEntry);    
    console.log('entry path(param)', entryPath);
        //read the file
        // let componentPath = path.resolve(`${(workspace.workspaceFolders? workspace.workspaceFolders[0].uri.path : '/') + entryPath}`);
        // console.log('comp path:', componentPath);
        let readURI: any = URI.file(entryPath);
        workspace.fs.readFile(readURI)
          .then((res: any) => {
            // console.log('reading file');
                // console.log("the esprima obj after res to string is:", esprima.parseModule(res.toString(), { tolerant: true, range: true, loc: true, jsx: true }));
  
                //create the import paths array
                // //create the components array
                // let componentsArray: Array<string> = [];
                
                // let esprimaObj = esprima.parseModule(res.toString(), { tolerant: true, range: true, loc: true, jsx: true });
                
                
                //find all import statements
                //find all the jsx elements using regex
                //template literal to add < with the name of the import statment for the search
                //only add the import statements that are jsx elements
                let holdingRes = res.toString();
                let result = parseAST(esprima.parseModule(res.toString(), { tolerant: true, range: true, loc: true, jsx: true }));
                // console.log("this is the result obj from parseAST", result);  
                
                let newResults: any = findComponentsInFile(result.components, holdingRes, result.paths, result.importLineNumbers);
                console.log("the newResult object is: ", newResults);
                if (entryPath !== originalEntry && newResults.importLineNumbers.length) {
                  dynamicImportFunc(readURI,newResults.importLineNumbers, result.exportLineNumber, newResults.components);
                }
                
                if (newResults.paths.length > 0) {
                for (let i=0; i<result.paths.length; i+=1) {
                  let currentPath = result.paths[i];
                //  console.log('current component path:', currentPath);
                 // console.log('split orig:', originalEntry.split(path.sep));
                 const originalSplitEntry = entryPath.split(path.sep);
                 const currentSplitArr = currentPath.split('/');
                 //iterate thru split array, if elem is '.' pop(), 
                 //if elem is '..', start a counter at 1, and increment each instance; then splice;
                 let counter = 1;
                 for (let j = 0; j <= currentSplitArr.length - 1; j++) {
                  //  console.log('current,', currentSplitArr)
                   if (currentSplitArr[j] === '.') {
                     originalSplitEntry.pop();
                     currentSplitArr.splice(j, 1);
                    }
                   if (currentSplitArr[j] === '..') {
                     counter++;
                    }
                  }
                  if (counter !== 1) {
                    currentSplitArr.splice(0, counter - 1);
                    originalSplitEntry.splice(originalSplitEntry.length - counter);
                  }
                 console.log(...originalSplitEntry, ...currentSplitArr);
                let joinOriginalArr = [...originalSplitEntry].join('/');
                let joinCurrentArr = [...currentSplitArr].join('/');
                console.log('joined', joinOriginalArr);
                let resolvedPath = path.join(joinOriginalArr, joinCurrentArr);  
                 console.log('resolved:', resolvedPath);
                //  console.log('edited split arr', originalSplitEntry);               
                  traverseUserWorkspace(originalEntry, resolvedPath + '.jsx');
                }
            } 
        }); 
    }

 function parseAST(astObj: any) {
        console.log('entered~ astobj:', astObj);
        interface ImportObj {
          name: string;
          source: string;
          path: string;
          range?: number[];
          line?: number;
        }
        
        interface ResultObj {
          paths: Array<string>;
          components: any;
          exportLineNumber: number;
          importLineNumbers: number[];
          otherImports: any;
        }
      
        let resultObj: ResultObj = {
          paths:[],
           components:{},
             exportLineNumber:0,
              importLineNumbers:[],
               otherImports:{}};
        // for (let i=0; i<astObj.body.length; i+=1) {
          //Checking for JSX elements on the page..because we do not want to dynamically import non-component paths
          // if(astObj.body[i].type === 'ExpressionStatement') {
            //fin the jsx element
            // console.log('going into compNames pushing: ')
            //astObj.body[i].expression.arguments[0].type === 'JSXElement' &&
            // if( astObj.body[i].expression.arguments[0].openingElement.name.type === 'JSXIdentifier') {
              // console.log('we have a jsx attribute')
              
              // let compName = 
              //astObj.body[i].expression.arguments[0].openingElement.name.name;
              // resultObj.componentNames.push(compName);
            // }
          // }
        // }
        for (let i=0; i<astObj.body.length; i+=1) {
          let regex = /\//g;
          //"import...from..." statement case
          // console.log(`specifier${i}:`, astObj.body[i].specifiers)
      
          //Checking the import statments to find paths to dynamically import
          if (astObj.body[i].type === 'ImportDeclaration') {
            //if the current statement includes a child component import;
            let componentObj: ImportObj = {name : '', source: '', path: ''};
            if (astObj.body[i].specifiers[0] !== undefined) {
              componentObj.name = astObj.body[i].specifiers[0].local.name;
              componentObj.source = astObj.body[i].source.value;
              //check here to see if the import name is in the componentNames array
              if (astObj.body[i].source.value.match(regex)) {
      
                //only if it is inside of that array, then we will add the component object to the restlt components obj
                // console.log('jsxname: ', astObj.body[i].specifiers[0].local.name);
                // for(let k = 0; k < componentsArray.length; k++) {
                //   console.log('IN HERRRRRERERERERE')
                //   let currentName = componentsArray[k];
                  // if(resultObj.componentNames.includes(astObj.body[i].specifiers[0].local.name)) {
                    // if(astObj.body[i].specifiers[0].local.name === currentName) {
                      componentObj.path = astObj.body[i].source.value;
                      resultObj.paths.push(astObj.body[i].source.value);
                      resultObj.components[astObj.body[i].specifiers[0].local.name] = componentObj;
                      resultObj.importLineNumbers.push(astObj.body[i].loc.start.line);
                      
                    // }
                    // }
                    
                  // }
              } else if (astObj.body[i].source.value){
                resultObj.otherImports[astObj.body[i].source.value] = componentObj;
            }
          }
            //otherwise, it is other import statements
          } 
          //if export...from
          if (astObj.body[i].type === 'ExportDefaultDeclaration') {
            // if (astObj.body[i].expression.left.object.name === "exports") {
              //resultobj: line, 
              resultObj.exportLineNumber = astObj.body[i].loc.start.line;
            // }
          } 
        //find Variable Declarations with callee.name === 'require'
      } 
      console.log('resultObj: ', resultObj);
      return resultObj;
      }
      
function findComponentsInFile (componentsObj: any, stringifiedResult: string, pathsArray: Array<string>, importLineNumbers: Array<number>) {
//use regex to find component names
// let regex = //;
// let resultArray = [];
let newResultObj: any = {};
let componentNames = Object.keys(componentsObj);
for (let i=0; i<componentNames.length; i+=1) {
    let currentName = componentNames[i];
    let searchName = '<' + currentName;
    let regex = new RegExp (searchName, 'g');
    //logic to delete the irrelevant components from the resultObject
    //search name is the regex, 
    if (!stringifiedResult.match(regex)) {
        delete componentsObj[currentName];
        //what is being removed (index) = i
        pathsArray.splice(i,1);
        importLineNumbers.splice(i,1);
    }
    // resultArray.push(searchName);
}
newResultObj.components = componentsObj;
newResultObj.paths = pathsArray;
newResultObj.importLineNumbers = importLineNumbers;
return newResultObj;
}
