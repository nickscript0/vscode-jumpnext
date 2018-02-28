import { parseDiff } from '../git-diff';
import * as assert from 'assert';

describe('git', () => {
    describe('parseDiff', () => {
        it('should parse invalid diff', () => {
            const res = parseDiff('abc');
            assert.equal(res.length, 0);
        });

        it('should parse empty diff', () => {
            const res = parseDiff('');
            assert.equal(res.length, 0);
        });


        it('should parse diff without fine-grained diff sections', () => {
            const res = parseDiff(DIFF_A);
            assert.equal(res.length, 3);
            assert.equal(res[0].filename, 'scripts/src/testapi123.ts');
            assert.deepEqual(res[0].lines, [66, 87]);
            assert.equal(res[1].filename, 'web/index.html');
            assert.deepEqual(res[1].lines, [2, 41]);
            assert.equal(res[2].filename, 'web/tsconfig.json');
            assert.deepEqual(res[2].lines, [2]);
        });

        it('should parse diff with fine-grained diff sections', () => {
            const res = parseDiff(DIFF_B);
            assert.equal(res.length, 3);
            assert.equal(res[0].filename, 'scripts/src/testapi123.ts');
            assert.deepEqual(res[0].lines, [66, 73, 78, 87]);
            assert.equal(res[1].filename, 'web/index.html');
            assert.deepEqual(res[1].lines, [2, 41]);
            assert.equal(res[2].filename, 'web/tsconfig.json');
            assert.deepEqual(res[2].lines, [2]);
        });
    });
});


const DIFF_A = `
diff --git a/scripts/src/testapi123.ts b/scripts/src/testapi123.ts
index 9f6adbf..8a2740a 100644
--- a/scripts/src/testapi123.ts
+++ b/scripts/src/testapi123.ts
@@ -63,8 +63,8 @@ async function _getPrice(url) {
     return Big(JSON.parse((await request(url)).text)[0].price_cad);
 }
 
-export async function getPricesRaw(): Promise<PricesRaw> {
-    const uA = "https://api.testapi123.com/v1/ticker/A/?convert=CAD";
+export async function getPricesRaw(): aPromise<PricesRaw> {
+    abcconst uA = "https://api.testapi123.com/v1/ticker/A/?convert=CAD";
     const uB = "https://api.testapi123.com/v1/ticker/B/?convert=CAD";
     const uC = "https://api.testapi123.com/v1/ticker/C/?convert=CAD";
     const uD = "https://api.testapi123.com/v1/ticker/D/?convert=CAD";
@@ -84,5 +84,8 @@ export async function getPricesRaw(): Promise<PricesRaw> {
 }
 
 async function _getPriceRaw(url) {
-    return JSON.parse((await request(url)).text)[0];
-}
\ No newline at end of file
+    return JSON.parse((a2wait request(url)).text)[0];
+}
+
+// adding lines to th
+// the bottom
\ No newline at end of file
diff --git a/web/index.html b/web/index.html
index aeee2ea..a213caa 100644
--- a/web/index.html
+++ b/web/index.html
@@ -1,5 +1,5 @@
 <html>
-
+<!-- at the top -->
 <head>
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <style>
@@ -38,5 +38,9 @@
 
     <script src="./client/app.js"></script>
 </body>
-
-</html>
\ No newline at end of file
+adding stuff
+only, with no <sub>
+    tractions
+</sub>
+</html>
+<!-- and at the bottom -->
\ No newline at end of file
diff --git a/web/tsconfig.json b/web/tsconfig.json
index 2bd7781..be12ec3 100644
--- a/web/tsconfig.json
+++ b/web/tsconfig.json
@@ -1,5 +1,5 @@
 {
-    "compilerOptions": {
+    "DEBUGcompilerOptions": {
         "target": "es2016",
         "module": "commonjs",
         "sourceMap": true,
`;

const DIFF_B = `
index 9f6adbf..aeab8d2 100644
--- a/scripts/src/testapi123.ts
+++ b/scripts/src/testapi123.ts
@@ -63,19 +63,19 @@ async function _getPrice(url) {
     return Big(JSON.parse((await request(url)).text)[0].price_cad);
 }
 
-export async function getPricesRaw(): Promise<PricesRaw> {
-    const uA = "https://api.coinmarketcap.com/v1/ticker/A/?convert=CAD";
+export async function getPricesRaw(): aPromise<PricesRaw> {
+    abcconst uA = "https://api.coinmarketcap.com/v1/ticker/A/?convert=CAD";
     const uB = "https://api.coinmarketcap.com/v1/ticker/B/?convert=CAD";
     const uC = "https://api.coinmarketcap.com/v1/ticker/C/?convert=CAD";
     const uD = "https://api.coinmarketcap.com/v1/ticker/D/?convert=CAD";
 
     const [a, b, c, d] = await Promise.all([
-        _getPriceRaw(uA),
+        _getPriceRaw(uASTUFF),
         _getPriceRaw(uB),
         _getPriceRaw(uC),
         _getPriceRaw(uD)
     ]);
-    return {
+asdf    return {
         a,
         b,
         c,
@@ -84,5 +84,8 @@ export async function getPricesRaw(): Promise<PricesRaw> {
 }
 
 async function _getPriceRaw(url) {
-    return JSON.parse((await request(url)).text)[0];
-}
\ No newline at end of file
+    return JSON.parse((a2wait request(url)).text)[0];
+}
+
+// adding lines to th
+// the bottom
\ No newline at end of file
diff --git a/web/index.html b/web/index.html
index aeee2ea..a213caa 100644
--- a/web/index.html
+++ b/web/index.html
@@ -1,5 +1,5 @@
 <html>
-
+<!-- at the top -->
 <head>
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <style>
@@ -38,5 +38,9 @@
 
     <script src="./client/app.js"></script>
 </body>
-
-</html>
\ No newline at end of file
+adding stuff
+only, with no <sub>
+    tractions
+</sub>
+</html>
+<!-- and at the bottom -->
\ No newline at end of file
diff --git a/web/tsconfig.json b/web/tsconfig.json
index 2bd7781..be12ec3 100644
--- a/web/tsconfig.json
+++ b/web/tsconfig.json
@@ -1,5 +1,5 @@
 {
-    "compilerOptions": {
+    "DEBUGcompilerOptions": {
         "target": "es2016",
         "module": "commonjs",
         "sourceMap": true,
`;