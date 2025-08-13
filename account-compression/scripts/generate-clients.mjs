#!/usr/bin/env zx
import "zx/globals";
import {
  bottomUpTransformerVisitor,
  createFromRoot,
  rootNodeVisitor,
  updateProgramsVisitor,
} from "codama";
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

// Add the program from spl_noop as an additional program
const codamaNoopRoot = rootNodeFromAnchor(
  require(path.join(workingDirectory, "sdk", "idl", "spl_noop.json"))
);

codama.update(
  rootNodeVisitor((node) => ({
    ...node,
    additionalPrograms: [...node.additionalPrograms, codamaNoopRoot.program],
  }))
);

// Render tree.
writeFileSync(
  path.join(workingDirectory, "trees", "codama.json"),
  JSON.stringify(JSON.parse(codama.getJson()), null, 2)
);
