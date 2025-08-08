#!/usr/bin/env zx
import "zx/globals";
import { createFromRoot } from "codama";
import { rootNodeFromAnchor } from "@codama/nodes-from-anchor";
import { renderVisitor as renderJavaScriptVisitor } from "@codama/renderers-js";
// import { renderVisitor as renderRustVisitor } from "@codama/renderers-rust";
import { writeFileSync } from "fs";
import { workingDirectory } from "./utils.mjs";

// Instanciate Codama.
const codama = createFromRoot(
  rootNodeFromAnchor(
    require(
      path.join(workingDirectory, "sdk", "idl", "spl_account_compression.json")
    )
  )
);

// Render tree.
writeFileSync(
  path.join(workingDirectory, "trees", "codama.json"),
  JSON.stringify(JSON.parse(codama.getJson()), null, 2)
);
