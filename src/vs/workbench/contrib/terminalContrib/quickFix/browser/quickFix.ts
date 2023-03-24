/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IAction } from 'vs/base/common/actions';
import { ITerminalCommand } from 'vs/workbench/contrib/terminal/common/terminal';
import { CancellationToken } from 'vs/base/common/cancellation';
import { URI } from 'vs/base/common/uri';
import { ITerminalCommandSelector, ITerminalOutputMatch, ITerminalOutputMatcher } from 'vs/platform/terminal/common/terminal';

export const ITerminalQuickFixService = createDecorator<ITerminalQuickFixService>('terminalQuickFixService');
export interface ITerminalQuickFixService {
	onDidRegisterProvider: Event<ITerminalQuickFixProviderSelector>;
	onDidRegisterCommandSelector: Event<ITerminalCommandSelector>;
	onDidUnregisterProvider: Event<string>;
	readonly _serviceBrand: undefined;
	// TODO: name
	readonly terminalQuickFixes: Promise<Array<ITerminalCommandSelector>>;
	providers: Map<string, ITerminalQuickFixProvider>;
	registerQuickFixProvider(id: string, provider: ITerminalQuickFixProvider): IDisposable;
	registerCommandSelector(selector: ITerminalCommandSelector): void;
}

export interface ITerminalQuickFixProviderSelector {
	selector: ITerminalCommandSelector;
	provider: ITerminalQuickFixProvider;
}

export type TerminalQuickFixActionInternal = IAction | ITerminalQuickFixCommandAction | ITerminalQuickFixOpenerAction;
export type TerminalQuickFixCallback = (matchResult: ITerminalCommandMatchResult) => TerminalQuickFixActionInternal[] | TerminalQuickFixActionInternal | undefined;
export type TerminalQuickFixCallbackExtension = (terminalCommand: ITerminalCommand, lines: string[] | undefined, option: ITerminalQuickFixOptions, token: CancellationToken) => Promise<ITerminalQuickFix[] | ITerminalQuickFix | undefined>;

export interface ITerminalQuickFixProvider {
	/**
	 * Provides terminal quick fixes
	 * @param commandMatchResult The command match result for which to provide quick fixes
	 * @param token A cancellation token indicating the result is no longer needed
	 * @return Terminal quick fix(es) if any
	 */
	provideTerminalQuickFixes(terminalCommand: ITerminalCommand, lines: string[] | undefined, option: ITerminalQuickFixOptions, token: CancellationToken): Promise<ITerminalQuickFix[] | ITerminalQuickFix | undefined>;
}

export enum TerminalQuickFixType {
	Command = 0,
	Opener = 1,
	Port = 2
}

export interface ITerminalQuickFixOptions {
	type: 'internal' | 'resolved' | 'unresolved';
	id: string;
	commandLineMatcher: string | RegExp;
	outputMatcher?: ITerminalOutputMatcher;
	commandExitResult: 'success' | 'error';
}

export interface ITerminalQuickFix {
	type: TerminalQuickFixType;
	id: string;
	source: string;
}

export interface ITerminalQuickFixCommandAction extends ITerminalQuickFix {
	type: TerminalQuickFixType.Command;
	terminalCommand: string;
	// TODO: Should this depend on whether alt is held?
	addNewLine?: boolean;
}
export interface ITerminalQuickFixOpenerAction extends ITerminalQuickFix {
	type: TerminalQuickFixType.Opener;
	uri: URI;
}

export interface ITerminalCommandMatchResult {
	commandLine: string;
	commandLineMatch: RegExpMatchArray;
	outputMatch?: ITerminalOutputMatch;
}

// TODO: Prefix these
export interface IInternalOptions extends ITerminalQuickFixOptions {
	type: 'internal';
	getQuickFixes: TerminalQuickFixCallback;
}

export interface IResolvedExtensionOptions extends ITerminalQuickFixOptions {
	type: 'resolved';
	getQuickFixes: TerminalQuickFixCallbackExtension;
}

export interface IUnresolvedExtensionOptions extends ITerminalQuickFixOptions {
	type: 'unresolved';
}
