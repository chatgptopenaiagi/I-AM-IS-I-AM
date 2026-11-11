(* Independent fixed formulas; no arbitrary evaluation of input strings. Runtime unverified until actually executed. *)
ClearAll[TriadExperiment, TriadValidateInput, TriadManipulate, TriadFigures];
TriadValidateInput[data_] := Module[{id, claim, p, spec, bounds, keys},
  If[!AssociationQ[data] || Sort[Keys[data]] =!= Sort[{"schema_version", "source_revision", "claim_id", "experiment_id", "parameters"}], Return[False]];
  If[data["schema_version"] =!= "1.0" || !StringQ[data["source_revision"]] || !StringMatchQ[data["source_revision"], RegularExpression["atlas-fnv1a32:[0-9a-f]{8}"]], Return[False]];
  id = data["experiment_id"]; claim = data["claim_id"]; p = data["parameters"];
  spec = Switch[id,
    "ball-projection", {"ATLAS-BALL-PROJECTION", <|"s" -> {-1.2, 1.2}|>},
    "integer-access", {"ATLAS-INTEGER-ACCESS", <|"n" -> {-1000000, 1000000}, "center" -> {-1000000, 1000000}, "width" -> {2, 10}|>},
    "log-scale", {"ATLAS-LOG-SCALE", <|"q" -> {-12, 12}, "l0" -> {10^-9, 10^9}|>},
    "qfp-local", {"QFP-D005", <|"m3" -> {-1, 1}, "delta0" -> {-2, 2}, "delta2" -> {-1, 1}, "Phi0" -> {-2, 2}, "Phi2" -> {-1, 1}, "alpha" -> {-2, 2}, "Fp0" -> {-2, 2}, "Hp0" -> {-2, 2}, "Vp0" -> {-5, 5}, "rMax" -> {0.2, 3}, "Lambda" -> {-3, 3}|>},
    _, Return[False]];
  bounds = spec[[2]];
  If[claim =!= spec[[1]] || !AssociationQ[p] || Sort[Keys[p]] =!= Sort[Keys[bounds]], Return[False]];
  keys = Keys[bounds];
  If[!And @@ (Function[k, MemberQ[{Integer, Real}, Head[p[k]]] && TrueQ[bounds[k][[1]] <= p[k] <= bounds[k][[2]]]] /@ keys), Return[False]];
  If[id === "integer-access" && !And @@ (IntegerQ[p[#]] & /@ keys), Return[False]];
  True
];
TriadExperiment[data_] := Module[{id, p, output, radius2, length, reflected, r0, gb0, box, residual, solved, expected, close, lam},
  If[!TrueQ[TriadValidateInput[data]], Return[$Failed]];
  id = data["experiment_id"]; p = data["parameters"];
  output = Switch[id,
    "ball-projection",
      radius2 = Max[0., 1. - p["s"]^2];
      <|"projection" -> <|"kind" -> "disk", "radius" -> 1, "area" -> N[Pi]|>, "slice" -> <|"kind" -> Which[Abs[p["s"]] > 1, "empty", Abs[p["s"]] == 1, "point", True, "disk"], "radius" -> Sqrt[radius2], "area" -> N[Pi] radius2|>|>,
    "integer-access", <|"state" -> p["n"], "next" -> p["n"] + 1, "window" -> Range[p["center"] - p["width"], p["center"] + p["width"]], "state_visible" -> (Abs[p["n"] - p["center"]] <= p["width"])|>,
    "log-scale",
      length = N[p["l0"] 10.^p["q"]]; reflected = N[p["l0"] 10.^(-p["q"])];
      <|"length" -> length, "reflected_length" -> reflected, "product" -> length reflected, "reference_squared" -> p["l0"]^2, "recovered_q" -> (Log[10., length] - Log[10., N[p["l0"]]])|>,
    "qfp-local",
      r0 = 24 p["m3"] - 12 p["delta2"]; gb0 = 96 p["m3"] (p["m3"] - p["delta2"]); box = 6 p["Phi2"];
      residual = box - p["Vp0"] + r0 p["Fp0"] + p["alpha"] gb0 p["Hp0"];
      solved = (p["Vp0"] - r0 p["Fp0"] - p["alpha"] gb0 p["Hp0"])/6;
      lam = p["Lambda"]; expected = <|"R0" -> 4 lam, "GB0" -> 8 lam^2/3|>;
      close[a_, b_] := Abs[a - b] <= 10^-10 Max[1, Abs[a], Abs[b]];
      <|"R0" -> r0, "GB0" -> gb0, "boxPhi0" -> box, "scalarResidual" -> residual, "solvedPhi2" -> solved, "N_at_rMax" -> (1 - 2 p["m3"] p["rMax"]^2), "hasNZeroCrossing" -> (p["m3"] > 0 && 1 - 2 p["m3"] p["rMax"]^2 <= 0), "reference_class" -> Which[lam > 0, "de Sitter", lam < 0, "anti-de Sitter-type", True, "Minkowski"], "reference_check" -> <|"pass" -> (close[r0, expected["R0"]] && close[gb0, expected["GB0"]]), "actual" -> <|"R0" -> r0, "GB0" -> gb0|>, "expected" -> expected, "tolerance" -> N[10^-10]|>|>
  ];
  <|"schema_version" -> "1.0", "source_revision" -> data["source_revision"], "engine" -> "wolfram", "input" -> KeyTake[data, {"claim_id", "experiment_id", "parameters"}], "output" -> output, "runtime" -> <|"version" -> $Version, "system" -> $SystemID|>|>
];
(* Desktop front-end interaction only; no cloud deployment or frontend requirement for JSON runs. *)
TriadManipulate[] := TabView[{
 "Ball slice" -> Manipulate[Graphics[{LightGray, Disk[], If[Abs[s] > 1, {}, {Darker[Green], If[Abs[s] == 1, Point[{0, 0}], Disk[{0, 0}, Sqrt[1 - s^2]]]}]}, PlotRange -> 1.2, PlotLabel -> Row[{"Unit-ball slice: ", Which[Abs[s] > 1, "empty", Abs[s] == 1, "point", True, "disk"], "; not a physical mechanism"}]], {s, -1.2, 1.2}],
 "Integer access" -> Manipulate[ListPlot[Transpose[{Range[c - w, c + w], ConstantArray[0, 2 w + 1]}], PlotLabel -> Row[{"State n=", n, "; next=", n + 1, "; independent window"}], PlotRange -> {{c - w - 1, c + w + 1}, {-1, 1}}], {n, -20, 20, 1}, {c, -20, 20, 1}, {w, 2, 10, 1}],
 "Log scale" -> Manipulate[Plot[10^x, {x, -12, 12}, ScalingFunctions -> {None, "Log"}, Epilog -> {Red, PointSize[Large], Point[{q, 10^q}]} , PlotLabel -> "Length relative to l0; reciprocal correspondence only"], {q, -12, 12}],
 "QFP local" -> Manipulate[Plot[{m r^3, d r^2, 1 - 2 m r^2}, {r, 0, 3}, PlotLegends -> {"scaled m(r)", "delta(r)", "N(r)"}, PlotLabel -> "Truncated local ansatz; no global solution"], {m, -1, 1}, {d, -1, 1}]
}];
TriadFigures[] := <|
 "ball-slice" -> Graphics[{LightGray, Disk[], Darker[Green], Disk[{0, 0}, Sqrt[1 - .45^2]]}, PlotLabel -> "Unit-ball image (gray) and slice (green)", ImageSize -> 640],
 "integer-access" -> ListPlot[Table[{n, 0}, {n, -5, 5}], PlotRange -> {{-6, 6}, {-1, 1}}, PlotLabel -> "Finite viewing window in Z; T(n)=n+1", ImageSize -> 640],
 "log-scale" -> Plot[10^q, {q, -12, 12}, ScalingFunctions -> {None, "Log"}, PlotLabel -> "Positive reference-scaled length; not physical duality", ImageSize -> 640],
 "qfp-local" -> Plot[{.12 r^3, .04 r^2, 1 - .24 r^2}, {r, 0, 2}, PlotLegends -> {"scaled m", "delta", "N"}, PlotLabel -> "Truncated local QFP ansatz, not metric solution", ImageSize -> 640]
|>;
