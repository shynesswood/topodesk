export namespace cmdexec {
	
	export class ExecResult {
	    success: boolean;
	    stdout: string;
	    stderr: string;
	    exitCode: number;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new ExecResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.stdout = source["stdout"];
	        this.stderr = source["stderr"];
	        this.exitCode = source["exitCode"];
	        this.error = source["error"];
	    }
	}

}

export namespace models {
	
	export class CommandInfo {
	    name: string;
	    command: string;
	    type?: string;
	
	    static createFrom(source: any = {}) {
	        return new CommandInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.command = source["command"];
	        this.type = source["type"];
	    }
	}
	export class Edge {
	    id: string;
	    source: string;
	    target: string;
	    type?: string;
	    label?: string;
	
	    static createFrom(source: any = {}) {
	        return new Edge(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.source = source["source"];
	        this.target = source["target"];
	        this.type = source["type"];
	        this.label = source["label"];
	    }
	}
	export class Position {
	    x: number;
	    y: number;
	
	    static createFrom(source: any = {}) {
	        return new Position(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.x = source["x"];
	        this.y = source["y"];
	    }
	}
	export class Group {
	    id: string;
	    name: string;
	    color?: string;
	    nodeIds: string[];
	    position: Position;
	    width: number;
	    height: number;
	
	    static createFrom(source: any = {}) {
	        return new Group(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.color = source["color"];
	        this.nodeIds = source["nodeIds"];
	        this.position = this.convertValues(source["position"], Position);
	        this.width = source["width"];
	        this.height = source["height"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SoftwareInfo {
	    name: string;
	    props?: Record<string, string>;
	
	    static createFrom(source: any = {}) {
	        return new SoftwareInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.props = source["props"];
	    }
	}
	export class RDPInfo {
	    username?: string;
	    password?: string;
	    domain?: string;
	    port?: number;
	
	    static createFrom(source: any = {}) {
	        return new RDPInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.username = source["username"];
	        this.password = source["password"];
	        this.domain = source["domain"];
	        this.port = source["port"];
	    }
	}
	export class SSHInfo {
	    username?: string;
	    password?: string;
	    privateKey?: string;
	    port?: number;
	
	    static createFrom(source: any = {}) {
	        return new SSHInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.username = source["username"];
	        this.password = source["password"];
	        this.privateKey = source["privateKey"];
	        this.port = source["port"];
	    }
	}
	export class Node {
	    id: string;
	    name: string;
	    ip?: string;
	    description?: string;
	    position: Position;
	    os?: string;
	    ssh?: SSHInfo;
	    rdp?: RDPInfo;
	    software?: SoftwareInfo[];
	    commands?: CommandInfo[];
	
	    static createFrom(source: any = {}) {
	        return new Node(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.ip = source["ip"];
	        this.description = source["description"];
	        this.position = this.convertValues(source["position"], Position);
	        this.os = source["os"];
	        this.ssh = this.convertValues(source["ssh"], SSHInfo);
	        this.rdp = this.convertValues(source["rdp"], RDPInfo);
	        this.software = this.convertValues(source["software"], SoftwareInfo);
	        this.commands = this.convertValues(source["commands"], CommandInfo);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class ProjectInfo {
	    id: string;
	    name: string;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new ProjectInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	
	export class Viewport {
	    x: number;
	    y: number;
	    zoom: number;
	
	    static createFrom(source: any = {}) {
	        return new Viewport(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.x = source["x"];
	        this.y = source["y"];
	        this.zoom = source["zoom"];
	    }
	}
	export class TopologyProject {
	    version: number;
	    project: ProjectInfo;
	    nodes: Node[];
	    edges: Edge[];
	    groups: Group[];
	    viewport: Viewport;
	
	    static createFrom(source: any = {}) {
	        return new TopologyProject(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.version = source["version"];
	        this.project = this.convertValues(source["project"], ProjectInfo);
	        this.nodes = this.convertValues(source["nodes"], Node);
	        this.edges = this.convertValues(source["edges"], Edge);
	        this.groups = this.convertValues(source["groups"], Group);
	        this.viewport = this.convertValues(source["viewport"], Viewport);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace rdp {
	
	export class RDPResult {
	    success: boolean;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new RDPResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	    }
	}

}

export namespace ssh {
	
	export class SSHExecResult {
	    success: boolean;
	    stdout: string;
	    stderr: string;
	    exitCode: number;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new SSHExecResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.stdout = source["stdout"];
	        this.stderr = source["stderr"];
	        this.exitCode = source["exitCode"];
	        this.error = source["error"];
	    }
	}
	export class SSHResult {
	    success: boolean;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new SSHResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	    }
	}

}

