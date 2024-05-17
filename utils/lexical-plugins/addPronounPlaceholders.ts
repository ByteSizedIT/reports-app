import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TextNode } from "lexical";

export function PronounsPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor) return;
    const removeNodeListener = editor.registerNodeTransform(
      TextNode,
      (node) => {
        if (!node) return;

        const textContent = node.getTextContent();

        if (
          /\b(him|her|them|himself|herself|themself)([\s,.!?*-])/g.test(
            textContent
          )
        ) {
          node.setTextContent(
            textContent.replace(
              /\b(him|her|them|himself|herself|themself)([\s,.!?*-])/g,
              function (match, p1, p2) {
                return p1 === "him" || p1 === "her" || p1 === "them"
                  ? "{them}" + p2
                  : "{themself}" + p2;
              }
            )
          );

          node.selectEnd();
        }
      }
    );
    return () => removeNodeListener();
  }, [editor]);

  return null;
}
