<h1 id="id-jquery">jQuery</h1>
<blockquote>
<p>jQuery is a fast, small, and feature-rich JavaScript library.</p>
</blockquote>
<p>For information on how to get started and how to use jQuery, please see <a href="https://api.jquery.com/">jQuery&#39;s documentation</a>.
For source files and issues, please visit the <a href="https://github.com/jquery/jquery">jQuery repo</a>.</p>
<p>If upgrading, please see the <a href="https://blog.jquery.com/2023/08/28/jquery-3-7-1-released-reliable-table-row-dimensions/">blog post for 3.7.1</a>. This includes notable differences from the previous version and a more readable changelog.</p>
<h2 id="id-including-jquery">Including jQuery</h2>
<p>Below are some of the most common ways to include jQuery.</p>
<h3 id="id-browser">Browser</h3>
<h4 id="id-script-tag">Script tag</h4>
<pre><code class="hljs language-html"><span class="hljs-tag">&lt;<span class="hljs-name">script</span> <span class="hljs-attr">src</span>=<span class="hljs-string">&quot;https://code.jquery.com/jquery-3.7.1.min.js&quot;</span>&gt;</span><span class="hljs-tag">&lt;/<span class="hljs-name">script</span>&gt;</span>
</code></pre>
<h4 id="id-webpack--browserify--babel">Webpack / Browserify / Babel</h4>
<p>There are several ways to use <a href="https://webpack.js.org/">Webpack</a>, <a href="http://browserify.org/">Browserify</a> or <a href="https://babeljs.io/">Babel</a>. For more information on using these tools, please refer to the corresponding project&#39;s documentation. In the script, including jQuery will usually look like this:</p>
<pre><code class="hljs language-js"><span class="hljs-keyword">import</span> $ <span class="hljs-keyword">from</span> <span class="hljs-string">&quot;jquery&quot;</span>;
</code></pre>
<p>If you need to use jQuery in a file that&#39;s not an ECMAScript module, you can use the CommonJS syntax:</p>
<pre><code class="hljs language-js"><span class="hljs-keyword">var</span> $ = <span class="hljs-built_in">require</span>( <span class="hljs-string">&quot;jquery&quot;</span> );
</code></pre>
<h4 id="id-amd-asynchronous-module-definition">AMD (Asynchronous Module Definition)</h4>
<p>AMD is a module format built for the browser. For more information, we recommend <a href="https://requirejs.org/docs/whyamd.html">require.js&#39; documentation</a>.</p>
<pre><code class="hljs language-js"><span class="hljs-title function_">define</span>( [ <span class="hljs-string">&quot;jquery&quot;</span> ], <span class="hljs-keyword">function</span>(<span class="hljs-params"> $ </span>) {

} );
</code></pre>
<h3 id="id-node">Node</h3>
<p>To include jQuery in <a href="https://nodejs.org/">Node</a>, first install with npm.</p>
<pre><code class="hljs language-sh">npm install jquery
</code></pre>
<p>For jQuery to work in Node, a window with a document is required. Since no such window exists natively in Node, one can be mocked by tools such as <a href="https://github.com/jsdom/jsdom">jsdom</a>. This can be useful for testing purposes.</p>
<pre><code class="hljs language-js"><span class="hljs-keyword">const</span> { <span class="hljs-variable constant_">JSDOM</span> } = <span class="hljs-built_in">require</span>( <span class="hljs-string">&quot;jsdom&quot;</span> );
<span class="hljs-keyword">const</span> { <span class="hljs-variable language_">window</span> } = <span class="hljs-keyword">new</span> <span class="hljs-title function_">JSDOM</span>( <span class="hljs-string">&quot;&quot;</span> );
<span class="hljs-keyword">const</span> $ = <span class="hljs-built_in">require</span>( <span class="hljs-string">&quot;jquery&quot;</span> )( <span class="hljs-variable language_">window</span> );
</code></pre>