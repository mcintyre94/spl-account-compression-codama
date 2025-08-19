#!/usr/bin/env zx
// @ts-check
import "zx/globals";
import {
  accountNode,
  argumentValueNode,
  assertIsNode,
  bottomUpTransformerVisitor,
  bytesTypeNode,
  createFromRoot,
  definedTypeLinkNode,
  instructionNode,
  instructionRemainingAccountsNode,
  prefixedCountNode,
  programNode,
  remainderCountNode,
  rootNodeVisitor,
  structFieldTypeNode,
  structTypeNode,
  unwrapTupleEnumWithSingleStructVisitor,
} from "codama";
import { rootNodeFromAnchor } from "@codama/nodes-from-anchor";
// import { renderVisitor as renderRustVisitor } from "@codama/renderers-rust";
import { renderVisitor as renderJavaScriptVisitor } from "@codama/renderers-js";
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
      transform: (node) => {
        assertIsNode(node, "programNode");

        return programNode({
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
                structFieldTypeNode({
                  name: "treeHeader",
                  type: definedTypeLinkNode("concurrentMerkleTreeHeaderData"),
                }),
                structFieldTypeNode({
                  name: "serializedTree",
                  type: bytesTypeNode(),
                }),
              ]),
            }),
          ],
        });
      },
    },
    // Use extra "proof" arg as remaining accounts.
    {
      select: "[instructionNode]verifyLeaf",
      transform: (node) => {
        assertIsNode(node, "instructionNode");
        return instructionNode({
          ...node,
          remainingAccounts: [
            instructionRemainingAccountsNode(argumentValueNode("proof"), {
              isOptional: true,
            }),
          ],
        });
      },
    },
  ])
);

// Transform tuple enum variants to structs.
codama.update(
  unwrapTupleEnumWithSingleStructVisitor(["ConcurrentMerkleTreeHeaderData.v1"])
);

// Render tree.
writeFileSync(
  path.join(workingDirectory, "trees", "codama.json"),
  JSON.stringify(JSON.parse(codama.getJson()), null, 2)
);

// Render Javascript client.
codama.accept(
  renderJavaScriptVisitor("clients/js/src/generated/", {
    deleteFolderBeforeRendering: true,
    formatCode: true,
    customAccountData: ["merkleTree"],
  })
);
