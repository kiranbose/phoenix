/*
 * GNU AGPL-3.0 License
 *
 * Copyright (c) 2021 - present core.ai . All rights reserved.
 * Original work Copyright (c) 2014 - 2021 Adobe Systems Incorporated. All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License
 * for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see https://opensource.org/licenses/AGPL-3.0.
 *
 */

/*global describe, beforeEach, afterEach, it, runs, expect, waitsForDone */

define(function (require, exports, module) {


    var SpecRunnerUtils = require("spec/SpecRunnerUtils");

    describe("MainViewFactory", function () {
        this.category = "mainview";

        var CommandManager,          // loaded from brackets.test
            Commands,                // loaded from brackets.test
            DocumentManager,         // loaded from brackets.test
            EditorManager,           // loaded from brackets.test
            MainViewManager,         // loaded from brackets.test
            ProjectManager,          // loaded from brackets.test
            FileSystem,              // loaded from brackets.test
            Dialogs;                 // loaded from brackets.test

        var testPath = SpecRunnerUtils.getTestPath("/spec/MainViewFactory-test-files"),
            testWindow,
            _$,
            promise;

        var getFileObject = function (name) {
            return FileSystem.getFileForPath(testPath + "/" + name);
        };

        beforeEach(function () {
            runs(function () {
                SpecRunnerUtils.createTestWindowAndRun(this, function (w) {
                    SpecRunnerUtils.loadProjectInTestWindow(testPath);
                    testWindow = w;
                    _$ = testWindow.$;

                    // Load module instances from brackets.test
                    CommandManager  = testWindow.brackets.test.CommandManager;
                    Commands        = testWindow.brackets.test.Commands;
                    DocumentManager = testWindow.brackets.test.DocumentManager;
                    EditorManager   = testWindow.brackets.test.EditorManager;
                    MainViewManager = testWindow.brackets.test.MainViewManager;
                    ProjectManager  = testWindow.brackets.test.ProjectManager;
                    FileSystem      = testWindow.brackets.test.FileSystem;
                    Dialogs         = testWindow.brackets.test.Dialogs;
                });
            });
            runs(function () {
                SpecRunnerUtils.loadProjectInTestWindow(testPath);
            });
        });

        afterEach(function () {
            MainViewManager._closeAll(MainViewManager.ALL_PANES);
            testWindow      = null;
            CommandManager  = null;
            Commands        = null;
            DocumentManager = null;
            EditorManager   = null;
            ProjectManager  = null;
            FileSystem      = null;
            SpecRunnerUtils.closeTestWindow();
        });

        describe("Opening and closing Images", function () {
            it("should open an image", function () {
                runs(function () {
                    promise = MainViewManager._open(MainViewManager.ACTIVE_PANE, getFileObject("/images/events.jpg"));
                    waitsForDone(promise, "MainViewManager.doOpen");
                });
                runs(function () {
                    expect(MainViewManager.getCurrentlyViewedFile(MainViewManager.ACTIVE_PANE).name).toEqual("events.jpg");
                    // should not have been added to the working set
                    expect(MainViewManager.getWorkingSetSize(MainViewManager.ALL_PANES)).toEqual(0);
                });
            });
            it("should close an image", function () {
                runs(function () {
                    promise = MainViewManager._open(MainViewManager.ACTIVE_PANE, getFileObject("/images/events.jpg"));
                    waitsForDone(promise, "MainViewManager.doOpen");
                });
                runs(function () {
                    MainViewManager._close(MainViewManager.ACTIVE_PANE, getFileObject("/images/events.jpg"));
                    expect(MainViewManager.getCurrentlyViewedFile(MainViewManager.ACTIVE_PANE)).toEqual(null);
                    expect(MainViewManager.getWorkingSetSize(MainViewManager.ALL_PANES)).toEqual(0);
                });
            });
            it("should add an image to the working set", function () {
                runs(function () {
                    promise = CommandManager.execute(Commands.CMD_ADD_TO_WORKINGSET_AND_OPEN,  { fullPath: testPath + "/images/events.jpg" });
                    waitsForDone(promise, Commands.CMD_ADD_TO_WORKINGSET_AND_OPEN);
                });
                runs(function () {
                    expect(MainViewManager.getCurrentlyViewedFile(MainViewManager.ACTIVE_PANE).name).toEqual("events.jpg");
                    expect(MainViewManager.getWorkingSetSize(MainViewManager.ALL_PANES)).toEqual(1);
                    expect(MainViewManager.findInWorkingSet(MainViewManager.ACTIVE_PANE, testPath + "/images/events.jpg")).not.toEqual(-1);
                });
            });
        });
        describe("Managing Image Views", function () {
            it("Image Views should Reparent", function () {
                runs(function () {
                    MainViewManager.setLayoutScheme(1, 2);
                    promise = CommandManager.execute(Commands.CMD_ADD_TO_WORKINGSET_AND_OPEN,  { fullPath: testPath + "/images/events.jpg",
                        paneId: "first-pane"});
                    waitsForDone(promise, Commands.CMD_ADD_TO_WORKINGSET_AND_OPEN);
                });
                runs(function () {
                    promise = CommandManager.execute(Commands.CMD_ADD_TO_WORKINGSET_AND_OPEN,  { fullPath: testPath + "/images/lrg_logo.png",
                        paneId: "second-pane"});
                    waitsForDone(promise, Commands.CMD_ADD_TO_WORKINGSET_AND_OPEN);
                });
                runs(function () {
                    promise = CommandManager.execute(Commands.CMD_ADD_TO_WORKINGSET_AND_OPEN,  { fullPath: testPath + "/images/specials.jpg",
                        paneId: "second-pane"});
                    waitsForDone(promise, Commands.CMD_ADD_TO_WORKINGSET_AND_OPEN);
                });
                runs(function () {
                    promise = CommandManager.execute(Commands.CMD_ADD_TO_WORKINGSET_AND_OPEN,  { fullPath: testPath + "/images/lrg_hero.jpg",
                        paneId: "second-pane"});
                    waitsForDone(promise, Commands.CMD_ADD_TO_WORKINGSET_AND_OPEN);
                });
                runs(function () {
                    MainViewManager.setLayoutScheme(1, 1);
                    expect(MainViewManager._getPaneIdForPath(testPath + "/images/events.jpg")).toEqual("first-pane");
                    expect(MainViewManager._getPaneIdForPath(testPath + "/images/lrg_logo.png")).toEqual("first-pane");
                    expect(MainViewManager._getPaneIdForPath(testPath + "/images/specials.jpg")).toEqual("first-pane");
                    expect(MainViewManager._getPaneIdForPath(testPath + "/images/lrg_hero.jpg")).toEqual("first-pane");
                });
            });
        });
    });
});
