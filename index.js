var fs = require('fs');
var xml = fs.readFileSync("../Vulkan-Docs/xml/vk.xml").toString("utf-8");
var pjXML = require('pjxml');
var doc = pjXML.parse(xml)



let types = {};

for (let i=0;i<doc.content.length;i++) {
    let element = doc.content[i];
    if (element.type == 1 && element.name == "registry") {
        for (let j=0;j<element.content.length;j++) {
            let sub = element.content[j];
            if (sub.type == 1 && sub.name == "types") {
                types = sub;
            }
        }
    }
}

let parseStructs = (types, category = "struct")=>{
    let structs = {};
    for (let i=0;i<types.content.length;i++) {
        let element = types.content[i];
        if (element.type == 1 && element.attributes["category"] == category) {
            structs[element.attributes["name"]] = {};
            for (let j=0;j<element.content.length;j++) {
                let member = element.content[j];
                
                let object = structs[element.attributes["name"]];
                if (member.type == 1 && member.name == "member") {

                    // get member name
                    let name = "";
                    
                    let membobj = {};
                    for (let k=0;k<member.content.length;k++) {
                        let tag = member.content[k];
                        if (tag.type == 1 && tag.name == "name") {
                            membobj = object[name = tag.content[0].trim()] = {
                                $content: [],
                                $text: [],
                                $pointer: false,
                                $string: false,
                                $arrayOfArray: false
                            }
                        }
                    }
                    
                    // get tag data
                    for (let k=0;k<member.content.length;k++) {
                        let tag = member.content[k];
                        if (tag.type == 1) {
                            membobj[tag.name] = tag.content[0];
                        }
                        if (typeof tag == "string" && tag.trim() != "" && tag.trim() != " " || typeof tag == "object") {
                            membobj.$content.push(typeof tag == "string" ? tag.trim() : tag);
                            if (tag.name != "comment") {
                                membobj.$text.push(typeof tag == "string" ? tag.trim() : tag.content[0].trim());
                            }
                        }
                    }

                    // determine pointer type
                    for (let k=0;k<member.content.length;k++) {
                        let tag = member.content[k];
                        if (typeof tag == "string" && tag.trim() == "*") {
                            
                            if (membobj.$pointer) {
                                membobj.$arrayOfArray = true;
                            }
                            if (membobj.$type == "char") {
                                membobj.$string = true;
                            }
                            membobj.$pointer = true;
                        }
                    }
                }
            }
        }
    }
    return structs;
};

let structs = Object.assign(parseStructs(doc, "struct"), parseStructs(types, "struct"));
let unions = Object.assign(parseStructs(doc, "union"), parseStructs(types, "union"));
console.log(structs);
