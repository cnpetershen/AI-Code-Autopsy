import { JSXElementInfo, ASTQuery } from './types.js';
import { queryElements } from './traverse.js';

export class ASTQueryBuilder {
  private query: ASTQuery = {};

  static select(): ASTQueryBuilder {
    return new ASTQueryBuilder();
  }

  tag(name: string | RegExp): this {
    this.query.tag = name;
    return this;
  }

  withClass(className: string | RegExp): this {
    this.query.hasClass = className;
    return this;
  }

  withAttribute(name: string | RegExp): this {
    this.query.hasAttribute = name;
    return this;
  }

  atDepth(min?: number, max?: number): this {
    this.query.depth = { min, max };
    return this;
  }

  withParent(tag: string | RegExp): this {
    this.query.parentTag = tag;
    return this;
  }

  withChildCount(min?: number, max?: number): this {
    this.query.childCount = { min, max };
    return this;
  }

  withText(text: string | RegExp): this {
    this.query.hasText = text;
    return this;
  }

  build(): ASTQuery {
    return { ...this.query };
  }

  find(elements: JSXElementInfo[]): JSXElementInfo[] {
    return queryElements(elements, this.query);
  }
}

export function $q(elements: JSXElementInfo[]): ASTQueryBuilder {
  const builder = ASTQueryBuilder.select();
  const originalFind = builder.find.bind(builder);
  builder.find = () => originalFind(elements);
  return builder;
}

export function query(el: JSXElementInfo, q: ASTQuery): boolean {
  return queryElements([el], q).length > 0;
}

export { queryElements } from './traverse.js';
export type { ASTQuery };
