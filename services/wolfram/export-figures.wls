(* Optional exports only to a NEW directory under an explicitly supplied existing parent. *)
Get[FileNameJoin[{DirectoryName[$InputFileName], "TriadModels.wl"}]];
If[Length[$ScriptCommandLine] != 2, Print["Supply one existing output parent directory."]; Exit[2]];
parent = Last[$ScriptCommandLine];
If[!DirectoryQ[parent], Exit[2]];
out = CreateDirectory[FileNameJoin[{ExpandFileName[parent], "triad-" <> CreateUUID[]}]];
figures = TriadFigures[];
results = Flatten[KeyValueMap[Function[{name, graphic}, Table[Quiet[Check[Export[FileNameJoin[{out, name <> "." <> ToLowerCase[format]}], graphic, format], $Failed]], {format, {"SVG", "PNG"}}]], figures]];
Print[ExportString[<|"directory" -> out, "successful_exports" -> Count[results, _String], "failed_exports" -> Count[results, $Failed], "runtime" -> $Version, "limitations" -> "Static illustrations, not empirical evidence; frontend/rendering capability may be required."|>, "RawJSON"]];
If[MemberQ[results, $Failed], Exit[3]];
