
"use client";

export default function Home() {
  return (
    <section id="screen-1">
      <article>
          <header>
              <h1>Project Dinn</h1>
          </header>
          <hr />
          <h2 className="!mb-1">Belief Diagram Input: </h2>
          <div className="content">
            Input the belief diagram file below. The file should be a text file containing the belief diagram data in the specified format.
          </div>
          <input className="file-input" type="file" id="belief-diagram-file-input" accept=".txt" />
      </article>
    </section>
  );
}
