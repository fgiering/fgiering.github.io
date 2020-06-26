
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.22.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\Board.svelte generated by Svelte v3.22.2 */
    const file = "src\\Board.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (175:10) {#if item.selected}
    function create_if_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = " ";
    			attr_dev(div, "class", "dot svelte-ocpwaz");
    			add_location(div, file, 175, 12, 3926);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(175:10) {#if item.selected}",
    		ctx
    	});

    	return block;
    }

    // (172:6) {#each row as item, jj}
    function create_each_block_1(ctx) {
    	let div;
    	let p;
    	let t0_value = /*item*/ ctx[10].emoji + "";
    	let t0;
    	let p_id_value;
    	let t1;
    	let dispose;
    	let if_block = /*item*/ ctx[10].selected && create_if_block(ctx);

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[6](/*ii*/ ctx[9], /*jj*/ ctx[12], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(p, "id", p_id_value = "" + (/*ii*/ ctx[9] + "-" + /*jj*/ ctx[12]));
    			attr_dev(p, "class", "emoji svelte-ocpwaz");
    			add_location(p, file, 173, 10, 3833);
    			attr_dev(div, "class", "emoji-container svelte-ocpwaz");
    			add_location(div, file, 172, 8, 3747);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(div, t1);
    			if (if_block) if_block.m(div, null);
    			if (remount) dispose();
    			dispose = listen_dev(div, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*matrix*/ 1 && t0_value !== (t0_value = /*item*/ ctx[10].emoji + "")) set_data_dev(t0, t0_value);

    			if (/*item*/ ctx[10].selected) {
    				if (if_block) ; else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(172:6) {#each row as item, jj}",
    		ctx
    	});

    	return block;
    }

    // (170:2) {#each matrix as row, ii}
    function create_each_block(ctx) {
    	let div;
    	let t;
    	let each_value_1 = /*row*/ ctx[7];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "row svelte-ocpwaz");
    			add_location(div, file, 170, 4, 3689);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectEmoji, matrix*/ 3) {
    				each_value_1 = /*row*/ ctx[7];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(170:2) {#each matrix as row, ii}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let each_value = /*matrix*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "id", "board");
    			attr_dev(div, "class", "board svelte-ocpwaz");
    			add_location(div, file, 168, 0, 3624);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*matrix, selectEmoji*/ 3) {
    				each_value = /*matrix*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { emojis = [] } = $$props;
    	let count = 0;
    	let matrix = [];

    	onMount(() => {
    		let selection = [...emojis];

    		for (let i = 0; i < 5; ++i) {
    			let row = [];

    			for (let j = 0; j < 5; ++j) {
    				if (i === 2 && j === 2) {
    					row.push({ emoji: "󠀠", selected: true });
    					continue;
    				}

    				let index = Math.round(Math.random() * (selection.length - 1));
    				let emoji = selection[index];
    				selection.splice(index, 1);
    				row.push({ emoji, selected: false });
    			}

    			matrix.push(row);
    		}

    		$$invalidate(0, matrix);
    	});

    	function selectEmoji(i, j) {
    		let row = matrix[i];
    		let selection = row[j];
    		selection.selected = !selection.selected;
    		row[j] = selection;
    		$$invalidate(0, matrix[i] = row, matrix);
    		count += 1;

    		if (count >= 4) {
    			let bingo = findBingo();

    			if (bingo) {
    				dispatch("bingo", true);
    			}
    		}

    		let element = document.getElementById(i + "-" + j);
    		let name = "ding";
    		let volume = 0.1;

    		if (!selection.selected) {
    			name = "buzzer";
    			volume = 0.03;
    			element.classList.remove("emoji-spin");
    		} else {
    			element.classList.add("emoji-spin");
    		}

    		dispatch("playSound", { name, volume });
    	}

    	function findBingo() {
    		let selected = 0;

    		for (let i = 0; i < 5; ++i) {
    			selected = 0;

    			for (let j = 0; j < 5; ++j) {
    				let element = matrix[i][j];

    				if (element.selected) {
    					selected += 1;
    				}
    			}

    			if (selected == 5) {
    				return true;
    			}
    		}

    		for (let i = 0; i < 5; ++i) {
    			selected = 0;

    			for (let j = 0; j < 5; ++j) {
    				let element = matrix[j][i];

    				if (element.selected) {
    					selected += 1;
    				}
    			}

    			if (selected == 5) {
    				return true;
    			}
    		}

    		selected = 0;

    		for (let j = 0; j < 5; ++j) {
    			let element = matrix[j][j];

    			if (element.selected) {
    				selected += 1;
    			}
    		}

    		if (selected == 5) {
    			return true;
    		}

    		selected = 0;

    		for (let j = 0; j < 5; ++j) {
    			let element = matrix[j][4 - j];

    			if (element.selected) {
    				selected += 1;
    			}
    		}

    		if (selected == 5) {
    			return true;
    		}

    		return false;
    	}

    	const writable_props = ["emojis"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Board> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Board", $$slots, []);

    	const click_handler = (ii, jj, e) => {
    		selectEmoji(ii, jj);
    	};

    	$$self.$set = $$props => {
    		if ("emojis" in $$props) $$invalidate(2, emojis = $$props.emojis);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		dispatch,
    		emojis,
    		count,
    		matrix,
    		selectEmoji,
    		findBingo
    	});

    	$$self.$inject_state = $$props => {
    		if ("emojis" in $$props) $$invalidate(2, emojis = $$props.emojis);
    		if ("count" in $$props) count = $$props.count;
    		if ("matrix" in $$props) $$invalidate(0, matrix = $$props.matrix);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [matrix, selectEmoji, emojis, count, dispatch, findBingo, click_handler];
    }

    class Board extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { emojis: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Board",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get emojis() {
    		throw new Error("<Board>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set emojis(value) {
    		throw new Error("<Board>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Selector.svelte generated by Svelte v3.22.2 */
    const file$1 = "src\\Selector.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (123:6) {:else}
    function create_else_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = " ";
    			attr_dev(div, "class", "emoji svelte-18tta05");
    			add_location(div, file$1, 123, 8, 2555);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(123:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (121:6) {#if selection !== ''}
    function create_if_block$1(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*selection*/ ctx[0]);
    			attr_dev(p, "class", "emoji svelte-18tta05");
    			add_location(p, file$1, 121, 8, 2498);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selection*/ 1) set_data_dev(t, /*selection*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(121:6) {#if selection !== ''}",
    		ctx
    	});

    	return block;
    }

    // (134:2) {:else}
    function create_else_block(ctx) {
    	let div1;
    	let div0;
    	let t1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = " ";
    			t1 = space();
    			attr_dev(div0, "class", "emoji-selection blank svelte-18tta05");
    			add_location(div0, file$1, 135, 6, 2963);
    			attr_dev(div1, "class", "emoji-selection-container svelte-18tta05");
    			add_location(div1, file$1, 134, 4, 2916);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(134:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (130:2) {#each selections as selected}
    function create_each_block$1(ctx) {
    	let div;
    	let p;
    	let t0_value = /*selected*/ ctx[6] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(p, "class", "emoji-selection svelte-18tta05");
    			add_location(p, file$1, 131, 6, 2846);
    			attr_dev(div, "class", "emoji-selection-container svelte-18tta05");
    			add_location(div, file$1, 130, 4, 2799);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selections*/ 2 && t0_value !== (t0_value = /*selected*/ ctx[6] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(130:2) {#each selections as selected}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let button;
    	let span;
    	let button_disabled_value;
    	let t2;
    	let div2;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*selection*/ ctx[0] !== "") return create_if_block$1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value = /*selections*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block(ctx);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if_block.c();
    			t0 = space();
    			button = element("button");
    			span = element("span");
    			span.textContent = "Spin";
    			t2 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			attr_dev(div0, "class", "emoji-container svelte-18tta05");
    			add_location(div0, file$1, 119, 4, 2429);
    			add_location(span, file$1, 126, 86, 2699);
    			attr_dev(button, "class", "spin-button svelte-18tta05");
    			button.disabled = button_disabled_value = /*spinDisabled*/ ctx[2] ? "true" : "";
    			add_location(button, file$1, 126, 2, 2615);
    			attr_dev(div1, "id", "board");
    			attr_dev(div1, "class", "board svelte-18tta05");
    			add_location(div1, file$1, 118, 0, 2393);
    			attr_dev(div2, "class", "selections svelte-18tta05");
    			add_location(div2, file$1, 128, 0, 2735);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if_block.m(div0, null);
    			append_dev(div1, t0);
    			append_dev(div1, button);
    			append_dev(button, span);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div2, null);
    			}

    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*spin*/ ctx[3], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}

    			if (dirty & /*spinDisabled*/ 4 && button_disabled_value !== (button_disabled_value = /*spinDisabled*/ ctx[2] ? "true" : "")) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}

    			if (dirty & /*selections*/ 2) {
    				each_value = /*selections*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;

    				if (each_value.length) {
    					if (each_1_else) {
    						each_1_else.d(1);
    						each_1_else = null;
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block(ctx);
    					each_1_else.c();
    					each_1_else.m(div2, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block.d();
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			if (each_1_else) each_1_else.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { emojis = [] } = $$props;
    	let selection = "";
    	let selections = [];
    	let spinDisabled = false;

    	function spin() {
    		if (emojis.length <= 0) {
    			dispatch("done", true);
    			return;
    		}

    		dispatch("spin", true);
    		$$invalidate(2, spinDisabled = true);
    		let then = Date.now();

    		function animate() {
    			let index = Math.round(Math.random() * (emojis.length - 1));
    			$$invalidate(0, selection = emojis[index]);

    			if (Date.now() - then > 500 || emojis.length <= 1) {
    				selections.push(selection);
    				$$invalidate(1, selections);
    				emojis.splice(index, 1);
    				$$invalidate(4, emojis);
    				$$invalidate(2, spinDisabled = false);
    			} else {
    				window.requestAnimationFrame(animate);
    			}
    		}

    		window.requestAnimationFrame(animate);
    	}

    	const writable_props = ["emojis"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Selector> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Selector", $$slots, []);

    	$$self.$set = $$props => {
    		if ("emojis" in $$props) $$invalidate(4, emojis = $$props.emojis);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		emojis,
    		selection,
    		selections,
    		spinDisabled,
    		spin
    	});

    	$$self.$inject_state = $$props => {
    		if ("emojis" in $$props) $$invalidate(4, emojis = $$props.emojis);
    		if ("selection" in $$props) $$invalidate(0, selection = $$props.selection);
    		if ("selections" in $$props) $$invalidate(1, selections = $$props.selections);
    		if ("spinDisabled" in $$props) $$invalidate(2, spinDisabled = $$props.spinDisabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selection, selections, spinDisabled, spin, emojis];
    }

    class Selector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { emojis: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Selector",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get emojis() {
    		throw new Error("<Selector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set emojis(value) {
    		throw new Error("<Selector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.22.2 */
    const file$2 = "src\\App.svelte";

    // (113:0) {#if showMessage}
    function create_if_block_3(ctx) {
    	let div1;
    	let div0;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "message-text svelte-19iisxs");
    			add_location(div0, file$2, 114, 4, 2368);
    			attr_dev(div1, "class", "message svelte-19iisxs");
    			add_location(div1, file$2, 113, 2, 2302);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			div0.innerHTML = /*message*/ ctx[4];
    			if (remount) dispose();
    			dispose = listen_dev(div1, "click", /*click_handler*/ ctx[6], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*message*/ 16) div0.innerHTML = /*message*/ ctx[4];		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(113:0) {#if showMessage}",
    		ctx
    	});

    	return block;
    }

    // (140:6) {#if showSelector}
    function create_if_block_2(ctx) {
    	let current;

    	const selector = new Selector({
    			props: { emojis: /*emojis*/ ctx[0] },
    			$$inline: true
    		});

    	selector.$on("spin", /*spin_handler*/ ctx[12]);
    	selector.$on("done", /*done_handler*/ ctx[13]);

    	const block = {
    		c: function create() {
    			create_component(selector.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(selector, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const selector_changes = {};
    			if (dirty & /*emojis*/ 1) selector_changes.emojis = /*emojis*/ ctx[0];
    			selector.$set(selector_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selector.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selector.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(selector, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(140:6) {#if showSelector}",
    		ctx
    	});

    	return block;
    }

    // (136:4) {#if showBoard}
    function create_if_block_1(ctx) {
    	let current;

    	const board = new Board({
    			props: { emojis: /*emojis*/ ctx[0] },
    			$$inline: true
    		});

    	board.$on("bingo", /*bingo_handler*/ ctx[10]);
    	board.$on("playSound", /*playSound_handler*/ ctx[11]);

    	const block = {
    		c: function create() {
    			create_component(board.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(board, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const board_changes = {};
    			if (dirty & /*emojis*/ 1) board_changes.emojis = /*emojis*/ ctx[0];
    			board.$set(board_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(board.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(board.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(board, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(136:4) {#if showBoard}",
    		ctx
    	});

    	return block;
    }

    // (119:2) {#if !showBoard && !showSelector}
    function create_if_block$2(ctx) {
    	let div1;
    	let div0;
    	let t1;
    	let div4;
    	let div2;
    	let button0;
    	let span1;
    	let t2;
    	let span0;
    	let t3;
    	let button1;
    	let span3;
    	let t4;
    	let span2;
    	let t5;
    	let div3;
    	let button2;
    	let span5;
    	let t6;
    	let span4;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Emoji Bingo";
    			t1 = space();
    			div4 = element("div");
    			div2 = element("div");
    			button0 = element("button");
    			span1 = element("span");
    			t2 = text("Call");
    			span0 = element("span");
    			t3 = space();
    			button1 = element("button");
    			span3 = element("span");
    			t4 = text("Play");
    			span2 = element("span");
    			t5 = space();
    			div3 = element("div");
    			button2 = element("button");
    			span5 = element("span");
    			t6 = text("GitHub");
    			span4 = element("span");
    			attr_dev(div0, "class", "logo-text svelte-19iisxs");
    			add_location(div0, file$2, 120, 6, 2552);
    			attr_dev(div1, "class", "logo logo-border-animation svelte-19iisxs");
    			add_location(div1, file$2, 119, 4, 2504);
    			add_location(span0, file$2, 126, 67, 2731);
    			add_location(span1, file$2, 126, 57, 2721);
    			add_location(button0, file$2, 126, 8, 2672);
    			add_location(span2, file$2, 127, 67, 2815);
    			add_location(span3, file$2, 127, 57, 2805);
    			add_location(button1, file$2, 127, 8, 2756);
    			add_location(div2, file$2, 125, 6, 2657);
    			add_location(span4, file$2, 131, 108, 2999);
    			add_location(span5, file$2, 131, 96, 2987);
    			attr_dev(button2, "class", "github svelte-19iisxs");
    			add_location(button2, file$2, 130, 8, 2867);
    			add_location(div3, file$2, 129, 6, 2852);
    			attr_dev(div4, "class", "buttons svelte-19iisxs");
    			add_location(div4, file$2, 124, 4, 2628);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div2);
    			append_dev(div2, button0);
    			append_dev(button0, span1);
    			append_dev(span1, t2);
    			append_dev(span1, span0);
    			append_dev(div2, t3);
    			append_dev(div2, button1);
    			append_dev(button1, span3);
    			append_dev(span3, t4);
    			append_dev(span3, span2);
    			append_dev(div4, t5);
    			append_dev(div4, div3);
    			append_dev(div3, button2);
    			append_dev(button2, span5);
    			append_dev(span5, t6);
    			append_dev(span5, span4);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*click_handler_1*/ ctx[7], false, false, false),
    				listen_dev(button1, "click", /*click_handler_2*/ ctx[8], false, false, false),
    				listen_dev(button2, "click", /*click_handler_3*/ ctx[9], false, false, false)
    			];
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div4);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(119:2) {#if !showBoard && !showSelector}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t;
    	let div;
    	let current_block_type_index;
    	let if_block1;
    	let current;
    	let if_block0 = /*showMessage*/ ctx[1] && create_if_block_3(ctx);
    	const if_block_creators = [create_if_block$2, create_if_block_1, create_if_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*showBoard*/ ctx[3] && !/*showSelector*/ ctx[2]) return 0;
    		if (/*showBoard*/ ctx[3]) return 1;
    		if (/*showSelector*/ ctx[2]) return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			div = element("div");
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "column-center svelte-19iisxs");
    			add_location(div, file$2, 117, 0, 2434);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showMessage*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block1) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block1 = if_blocks[current_block_type_index];

    					if (!if_block1) {
    						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block1.c();
    					}

    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				} else {
    					if_block1 = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function playSound(name, volume) {
    	let sound = new Audio(name + ".ogg");
    	sound.volume = volume;
    	sound.play();
    }

    function setAnimation(on) {
    	let el = document.getElementById("board");

    	if (el) {
    		if (on) {
    			el.classList.add("logo-border-animation");
    		} else {
    			el.classList.remove("logo-border-animation");
    		}
    	}
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { emojis = [] } = $$props;
    	let showMessage = false;
    	let showSelector = false;
    	let showBoard = false;
    	let message = "";

    	function displayMessage(text) {
    		$$invalidate(4, message = `${text}<br>Click to restart.`);
    		$$invalidate(1, showMessage = true);
    	}

    	playSound("theme", 0.1);
    	const writable_props = ["emojis"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	const click_handler = () => location.reload();
    	const click_handler_1 = () => $$invalidate(2, showSelector = true);
    	const click_handler_2 = () => $$invalidate(3, showBoard = true);

    	const click_handler_3 = () => {
    		window.open("https://github.com/lettier/emoji-bingo");
    	};

    	const bingo_handler = () => {
    		displayMessage("BINGO!");
    		playSound("cheer", 0.1);
    	};

    	const playSound_handler = e => playSound(e.detail.name, e.detail.volume);
    	const spin_handler = () => playSound("spin", 0.3);

    	const done_handler = () => {
    		displayMessage("All done!");
    		playSound("cheer", 0.1);
    	};

    	$$self.$set = $$props => {
    		if ("emojis" in $$props) $$invalidate(0, emojis = $$props.emojis);
    	};

    	$$self.$capture_state = () => ({
    		Board,
    		Selector,
    		emojis,
    		showMessage,
    		showSelector,
    		showBoard,
    		message,
    		playSound,
    		setAnimation,
    		displayMessage
    	});

    	$$self.$inject_state = $$props => {
    		if ("emojis" in $$props) $$invalidate(0, emojis = $$props.emojis);
    		if ("showMessage" in $$props) $$invalidate(1, showMessage = $$props.showMessage);
    		if ("showSelector" in $$props) $$invalidate(2, showSelector = $$props.showSelector);
    		if ("showBoard" in $$props) $$invalidate(3, showBoard = $$props.showBoard);
    		if ("message" in $$props) $$invalidate(4, message = $$props.message);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		emojis,
    		showMessage,
    		showSelector,
    		showBoard,
    		message,
    		displayMessage,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		bingo_handler,
    		playSound_handler,
    		spin_handler,
    		done_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { emojis: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get emojis() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set emojis(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /*
      (C) 2020 David Lettier
      lettier.com
    */

    const app = new App({
      target: document.body,
      props: {
        emojis: [
          "🚕",
          "🚗",
          "🏎",
          "🛺",
          "🚙 (Wohnmobil)",
          "🐟 (Aufkleber)",
          "🚓",
          "🐴",
          "✈",
          "🏃‍♀️",
          "🚈",
          "🧺 (Wäsche)",
          "🏍",
          "🌉",
          "⚽ (Fußballfeld)",
          "Comic Sans",
          "🐶",
          "🛑",
          "🚧",
        ],
      },
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
