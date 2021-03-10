import { GlobalEnv } from "./compiler"
import * as BaseException from "./error";
import { Location } from "./ast"
 
export function importStackManager(importObject: any, sm: StackManager) {
  importObject.imports.pushStack = function (col: number, line: number, length: number, id: number) {
    sm.pushStack(col, line, length, id);
  }

  importObject.imports.popStack = function () {
    sm.popStack();
  }

  importObject.imports.checkStackOverFlow = function() {
    sm.checkStackOverFlow();
  }
}

export class StackManager {
  source : Array<string>;
  callStack : Array<Location>;
  
  constructor() {
    this.source = new Array();
    this.callStack = new Array();
  }

  pushStack(line: number, col: number, length: number, id: number) {
    this.callStack.push({line: line, col: col, length: length, fileId: id});
  }

  popStack() {
    this.callStack.pop();
  }

  checkStackOverFlow() {
    if (this.callStack.length >= 200) 
      throw new BaseException.RecursionError(this.source, deepcopy(this.callStack), "maximum recursion depth exceeded\n" + this.toString());
  }

  checkZeroDivision(denum : number) {
    if (denum == 0) 
      throw new BaseException.ZeroDivisionError(this.source, deepcopy(this.callStack));
  }
  
  toString() : string {
    var ret : string = "";
    var previous : string = this.callStack.length >= 5 ? "..." : "main";
    for (let i = Math.max(0, this.callStack.length - 4); i < this.callStack.length; i++) {
      let loc : Location = this.callStack[i];
      let file : string[] = this.source[loc.fileId].split("\n");
      ret += `line ${loc.line} in ${previous} \n`;
      previous = file[loc.line - 1].substring(loc.col - 1, loc.length + loc.col - 1);
      ret += `\t ${previous} \n`;
    }
    return ret;
  }
}

function deepcopy(array : Array<Location>) {
  var ret : Array<Location> = new Array();
  array.forEach(s => {
    ret.push({ line: s.line, col: s.col, length: s.length, fileId: s.fileId });
  });
  return ret;
}