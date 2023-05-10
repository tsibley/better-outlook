"use strict";

function load() {
    const observer = new MutationObserver((mutations, observer) => {
      // XXX TODO: Maybe do this all within requestIdleCallback? or maybe not.
      for (const mutation of mutations) {
        switch (mutation.type) {
          case "childList":
            removeCautionBanners(mutation.addedNodes);
            unfuckLinks(mutation.addedNodes);
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

  The content injected into the text/plain (quoted-printable) part is:

    CAUTION: This email originated from outside of the organization. Do not cli=
    ck links or open attachments unless you recognize the sender and know the c=
    ontent is safe.

  which renders in Outlook as:

    <div class="PlainText">
      CAUTION: This email originated from outside of the organization. Do not click links or open attachments unless you recognize the sender and know the content is safe.
      <br aria-hidden="true">
      <br aria-hidden="true">
      <br aria-hidden="true">

  */
  const cautionText = "CAUTION: This email originated from outside of the organization. Do not click links or open attachments unless you recognize the sender and know the content is safe.";

  const cautionSpans = Array.from(nodes)
    .flatMap(node => Array.from(node.getElementsByTagName("span")))
    .filter(span => span.attributes.style?.value.startsWith("color:#9C6500")
                 && span.textContent === "CAUTION:");

  const cautionTextNodes = Array.from(nodes)
    .flatMap(node => Array.from(node.getElementsByClassName("PlainText")))
    .map(div => div.childNodes[0])
    .filter(node => node?.nodeName === "#text" && node?.nodeValue?.trim() === cautionText);

  if (!cautionSpans.length && !cautionTextNodes.length)
    return;

  console.debug("Caution spans", cautionSpans);
  console.debug("Caution text nodes", cautionTextNodes);

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

    for (const cautionTextNode of cautionTextNodes) {
      while (cautionTextNode.nextElementSibling?.tagName === "BR") {
        cautionTextNode.nextElementSibling.remove();
      }
      cautionTextNode.remove();
    }
  });
}


function unfuckLinks(nodes) {
  const fuckedLinks = Array.from(nodes)
    .flatMap(node => Array.from(node.getElementsByTagName("a")))
    .filter(a => a.href?.startsWith("https://urldefense.com/"));

  if (!fuckedLinks.length)
    return;

  console.debug("Fucked links", fuckedLinks);

  requestAnimationFrame(() => {
    for (const a of fuckedLinks) {
      const fuckedUrl = a.href;
      const unfuckedUrl = deurchin(urloffense(fuckedUrl));

      a.href = unfuckedUrl;

      console.debug(`Unfucked ${fuckedUrl} → ${unfuckedUrl}`);
    }
  });

  /* URL Defense mangled this:
   *
   *   https://www.google.com/url?q=https://github.com/nextstrain/ebola/blob/bb9421bacbb2a3ce5db48c22cd716041858c913f/ingest/workflow/snakemake_rules/transform.smk#23L76-L84
   *
   * into:
   *
   *   https://www.google.com/url?q=https:**Agithub.com*nextstrain*ebola*blob*bb9421bacbb2a3ce5db48c22cd716041858c913f*ingest*workflow*snakemake_rules*transform.smk*23L76-L84
   *
   * Ugh my head.  WTF is "**A"??  Do not understand that yet.
   */
  function urloffense(url) {
    const match = url.match(/^https:\/\/urldefense[.]com\/v3\/__(?<mangledUrl>.+?)__;.*$/);

    if (!match?.groups.mangledUrl)
      return url;

    return match.groups.mangledUrl
      .replace(/(?<=http[s]:)[*][*]A/, "//") // Replace "https:**A" with "https://"
      .replace(/(.*)[*]/, "$1#")             // Replace last "*" with a "#" (terrible heuristic)
      .replace(/[*]/g, "/")                  // Replace remaining "*" with "/"
  }

  function deurchin(url) {
    url = new URL(url);

    const params = new URLSearchParams(
      Array.from(url.searchParams)
        .filter(([k, v]) => !k.startsWith("utm_"))
    );

    url.search = params.toString();
    return url.toString();
  }
}


load();
