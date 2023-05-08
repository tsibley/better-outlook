"use strict";

function load() {
    const observer = new MutationObserver((mutations, observer) => {
      // XXX TODO: Maybe do this all within requestIdleCallback? or maybe not.
      for (const mutation of mutations) {
        switch (mutation.type) {
          case "childList":
            removeCautionBanners(mutation.addedNodes);
            break;
        }
      }
    });

    observer.observe(document.body, {subtree: true, childList: true});

    console.debug("Tom's Outlook Web Access: mutation-observer.js loaded");
}


function removeCautionBanners(nodes) {
  /*

  The content injected into the text/html (quoted-printable) part is:

    <div style=3D"background-color:#FFEB9C; width:100%; border-style: solid; bo=
    rder-color:#9C6500; border-width:1pt; padding:2pt; font-size:10pt; line-hei=
    ght:12pt; font-family:''Calibri''; color:Black; text-align: left;">
    <span style=3D"color:#9C6500" ;=3D"" font-weight:bold;=3D"">CAUTION:</span>=
     This email originated from outside of the organization. Do not click links=
     or open attachments unless you recognize the sender and know the content i=
    s safe.</div>
    <br>
    <p></p>

  This renders in Outlook as:

    <div><span style="color:#9C6500">CAUTION:</span> This email originated from outside of the organization. Do not click links or open attachments unless you recognize the sender and know the content is safe.</div>
    <br aria-hidden="true">
    <p></p>

  */
  const cautionSpans = Array.from(nodes)
    .flatMap(node => Array.from(node.getElementsByTagName("span")))
    .filter(span => span.attributes.style?.value.startsWith("color:#9C6500")
                 && span.textContent === "CAUTION:");

  console.debug("Caution spans", cautionSpans);

  requestAnimationFrame(() => {
    for (const cautionSpan of cautionSpans) {
      const parentDiv = cautionSpan.parentElement;

      if (parentDiv?.tagName !== "DIV") {
        console.debug("Parent of", cautionSpan, "is not a <div>, skipping", parentDiv);
        continue;
      }

      const br = parentDiv.nextElementSibling;
      const emptyP = br?.nextElementSibling;

      if (br?.tagName === "BR")
        br.remove();

      if (emptyP?.tagName === "P" && emptyP?.textContent === "")
        emptyP.remove();

      parentDiv.remove();
    }
  });
}


load();
