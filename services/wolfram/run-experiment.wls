(* Fixed local JSON entry point. Input is data, never Wolfram source code. *)
Get[FileNameJoin[{DirectoryName[$InputFileName], "TriadModels.wl"}]];
If[!StringQ[$ScriptInputString] || StringLength[$ScriptInputString] > 16384, Exit[2]];
input = Quiet[Check[ImportString[$ScriptInputString, "RawJSON"], $Failed]];
result = Quiet[Check[TimeConstrained[TriadExperiment[input], 8, $Failed], $Failed]];
If[result === $Failed, Exit[2]];
json = Quiet[Check[ExportString[result, "RawJSON", "Compact" -> True], $Failed]];
If[!StringQ[json], Exit[2]];
Print[json];
