import { describe, it } from "node:test";
import assert from "node:assert";
import { XMLNode } from "@kiosk-app/xml";

describe("XMLNode", () => {
    it("serialize a single node", () => {
        const node = new XMLNode("entry");
        assert.equal(node.serialize(), `<entry></entry>`);
    });

    it("serializes 1 nested child", () => {
        const entry = new XMLNode("entry");
        const title = new XMLNode("title");
        title.textContent = "Hello World!";
        entry.appendChild(title);

        const expects = `<entry><title>Hello World!</title></entry>`;
        const actual = entry.serialize();

        assert.equal(expects, actual);
    });

    it("serializes 2 nested children", () => {
        const now = new Date();

        const entry = new XMLNode("entry");
        const title = new XMLNode("title");
        title.textContent = "Hello World"
        const id = new XMLNode("id");
        id.textContent = "http://signage";
        const updated = new XMLNode("updated");
        updated.textContent = now;
        entry.appendChild(title);
        entry.appendChild(id);
        entry.appendChild(updated)

        const expects = `<entry><title>Hello World</title><id>http://signage</id><updated>${now}</updated></entry>`;
        const actual = entry.serialize();

        assert.equal(expects, actual);
    });

    it("serializes deeply nested children", () => {
        const feed = new XMLNode("feed");
        const author = new XMLNode("author");
        const name = new XMLNode("name")
        name.textContent = "Jane Doe";
        const email = new XMLNode("email");
        email.textContent = "jane.doe@contoso.web";
        const uri = new XMLNode("uri");
        uri.textContent = "http://contoso.web/jane-doe";
        author.appendChild(name);
        author.appendChild(email);
        author.appendChild(uri);
        feed.appendChild(author);

        const expects = `<feed><author><name>Jane Doe</name><email>jane.doe@contoso.web</email><uri>http://contoso.web/jane-doe</uri></author></feed>`;
        const actual = feed.serialize();

        assert.equal(expects, actual);
    });

    it("self-closing nodes", () => {

    })
})