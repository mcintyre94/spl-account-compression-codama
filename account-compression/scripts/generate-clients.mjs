#!/usr/bin/env zx
import "zx/globals";
import {
  accountNode,
  argumentValueNode,
  arrayTypeNode,
  arrayValueNode,
  assertIsNode,
  bottomUpTransformerVisitor,
  bytesTypeNode,
  createFromRoot,
  definedTypeLinkNode,
  instructionArgumentLinkNode,
  instructionArgumentNode,
  instructionNode,
  instructionRemainingAccountsNode,
  programNode,
  publicKeyTypeNode,
  remainderCountNode,
  rootNode,
  rootNodeVisitor,
  sizePrefixTypeNode,
  structFieldTypeNode,
  structTypeNode,
  updateAccountsVisitor,
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

// Add the program from spl_noop as an additional program.
const codamaNoopRoot = rootNodeFromAnchor(
  require(path.join(workingDirectory, "sdk", "idl", "spl_noop.json"))
);

codama.update(
  rootNodeVisitor((node) => ({
    ...node,
    additionalPrograms: [...node.additionalPrograms, codamaNoopRoot.program],
  }))
);

// Custom tree updates.
codama.update(
  bottomUpTransformerVisitor([
    {
      select: "[programNode]splAccountCompression",
      transform: (node) =>
        programNode({
          ...node,
          accounts: [
            ...node.accounts,
            accountNode({
              name: "merkleTree",
              data: structTypeNode([
                structFieldTypeNode({
                  name: "discriminator",
                  type: definedTypeLinkNode("compressionAccountType"),
                }),
                structTypeNode({
                  name: "treeHeader",
                  type: definedTypeLinkNode("concurrentMerkleTreeHeaderData"),
                }),
                structFieldTypeNode({
                  name: "serializedTree",
                  type: sizePrefixTypeNode(
                    bytesTypeNode(),
                    remainderCountNode()
                  ),
                }),
              ]),
            }),
          ],
        }),
    },
    // Use extra "proof" arg as remaining accounts.
    {
      select: "[instructionNode]verifyLeaf",
      transform: (node) =>
        instructionNode({
          ...node,
          remainingAccounts: instructionRemainingAccountsNode(
            argumentValueNode("proof"),
            {
              isOptional: true,
            }
          ),
        }),
    },
  ])
);

updateAccountsVisitor({
  abc: {},
});

// Render tree.
writeFileSync(
  path.join(workingDirectory, "trees", "codama.json"),
  JSON.stringify(JSON.parse(codama.getJson()), null, 2)
);
