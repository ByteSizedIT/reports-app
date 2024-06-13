import { useEffect, useMemo } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TextNode } from "lexical";

export function PronounsPlugin() {
  const regexPattern = useMemo(
    () => /\b(he|she|they|him|her|them|himself|herself|themself)([\s,.!?*-])/gi,
    []
  );

  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor) return;
    const removeNodeListener = editor.registerNodeTransform(
      TextNode,
      (node) => {
        if (!node) return;

        const textContent = node.getTextContent();

        if (
          // /\b(he|she|they|him|her|them|himself|herself|themself)([\s,.!?*-])/gi.test(
          regexPattern.test(textContent)
        ) {
          node.setTextContent(
            textContent.replace(
              // /\b(he|she|they|him|her|them|himself|herself|themself)([\s,.!?*-])/gi,
              regexPattern,
              function (match, p1, p2) {
                if (p1 === "he" || p1 === "she" || p1 === "they")
                  return "{they}" + p2;
                if (p1 === "He" || p1 === "She" || p1 === "They")
                  return "{They}" + p2;
                if (p1 === "him" || p1 === "her" || p1 === "them")
                  return "{them}" + p2;
                else return "{themself}" + p2;
              }
            )
          );

          node.selectEnd();
        }
      }
    );
    return () => removeNodeListener();
  }, [editor, regexPattern]);

  return null;
}
