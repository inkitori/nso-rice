// Windose Start: a launcher drawn with the game's own Start menu sprites.
// ⌥Space or the taskbar's START button toggles it (`WindoseStart --toggle`). Type to search apps; ↑↓ ⏎ esc.
import AppKit
import Carbon.HIToolbox
import SwiftUI

let ink = Color(red: 0x4d / 255, green: 0x23 / 255, blue: 0xcf / 255)
let lilac = Color(red: 0xa0 / 255, green: 0x8c / 255, blue: 0xe6 / 255)
let toggleNote = Notification.Name("nso.windose-start.toggle")
let W: CGFloat = 420, ROWS = 8, ROW: CGFloat = 40, TOP: CGFloat = 36  // TOP: SketchyBar height

func sprite(_ n: String) -> NSImage { NSImage(contentsOf: Bundle.main.url(forResource: n, withExtension: "png")!)! }

func pixel(_ s: String, size: CGFloat) -> Font { .custom(s, size: size) }

// App icons redrawn at 16px with hard alpha, so they read as pixel art next to the game's.
func pixelate(_ img: NSImage, px: Int = 16) -> NSImage {
  let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: px, pixelsHigh: px, bitsPerSample: 8, samplesPerPixel: 4,
                             hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
  NSGraphicsContext.current?.imageInterpolation = .high
  img.draw(in: NSRect(x: 0, y: 0, width: px, height: px))
  NSGraphicsContext.restoreGraphicsState()
  let p = rep.bitmapData!
  for i in stride(from: 0, to: px * px * 4, by: 4) {
    let a = Int(p[i + 3])
    if a < 128 { p[i] = 0; p[i + 1] = 0; p[i + 2] = 0; p[i + 3] = 0; continue }
    for c in 0..<3 { p[i + c] = UInt8(min(255, Int(p[i + c]) * 255 / a)) }
    p[i + 3] = 255
  }
  let out = NSImage(size: NSSize(width: px, height: px))
  out.addRepresentation(rep)
  return out
}

func sh(_ cmd: String) {
  let p = Process()
  p.executableURL = URL(fileURLWithPath: "/bin/zsh")
  p.arguments = ["-lc", cmd]
  try? p.run()
}

struct Item: Identifiable {
  enum Icon { case sprite(String, tint: Bool), image(NSImage) }
  let id: String
  let title: String
  let icon: Icon
  let run: () -> Void
}

// Subsequence match; prefix and substring hits rank first, shorter names break ties.
func score(_ q: String, _ s: String) -> Int? {
  let q = q.lowercased(), s = s.lowercased()
  if s.hasPrefix(q) { return 3000 - s.count }
  if s.contains(" " + q) { return 2000 - s.count }
  if s.contains(q) { return 1000 - s.count }
  var i = s.startIndex, gaps = 0
  for c in q {
    guard let r = s[i...].firstIndex(of: c) else { return nil }
    gaps += s.distance(from: i, to: r)
    i = s.index(after: r)
  }
  return 500 - gaps * 10 - s.count
}

final class Model: ObservableObject {
  @Published var query = "" { didSet { refresh() } }
  @Published var results: [Item] = []
  @Published var sel = 0
  var apps: [Item] = []
  var icons: [String: NSImage] = [:]
  var hide: () -> Void = {}

  // The game's own Start menu (My Documents, My Pictures, Control Panel, Restart, Shut Down), mapped to this Mac.
  lazy var menu: [Item] = [
    Item(id: "docs", title: "My Documents", icon: .sprite("icon_desktop_text", tint: false)) { sh("open ~/Documents") },
    Item(id: "pics", title: "My Pictures", icon: .sprite("icon_picture", tint: true)) { sh("open ~/Pictures") },
    Item(id: "control", title: "Control Panel", icon: .sprite("icon_gear", tint: true)) { sh("open -a 'System Settings'") },
    Item(id: "restart", title: "Restart Desktop", icon: .sprite("windose_logo", tint: false)) {
      sh("brew services restart sketchybar; yabai --restart-service; killall Übersicht; sleep 1; open -a Übersicht")
    },
    Item(id: "sleep", title: "Shut Down (Sleep)", icon: .sprite("icon_desktop_neru", tint: false)) { sh("pmset sleepnow") },
  ]
  lazy var commands: [Item] = menu + ["ame", "kangel", "galaxy", "street", "windose"].map { m in
    Item(id: "wall-\(m)", title: "Wallpaper: \(m.capitalized)", icon: .sprite("icon_picture", tint: true)) {
      sh("~/.config/nso/wall.sh \(m)")
    }
  }

  func scan() {
    let fm = FileManager.default
    let dirs = ["/Applications", "/Applications/Utilities", "/System/Applications", "/System/Applications/Utilities",
                NSHomeDirectory() + "/Applications", "/System/Library/CoreServices/Applications"]
    var seen = Set<String>()
    apps = dirs.flatMap { d in
      ((try? fm.contentsOfDirectory(atPath: d)) ?? []).filter { $0.hasSuffix(".app") }.compactMap { f -> Item? in
        let name = String(f.dropLast(4)), path = "\(d)/\(f)"
        guard seen.insert(name).inserted, name != "Windose Start" else { return nil }
        if icons[path] == nil { icons[path] = pixelate(NSWorkspace.shared.icon(forFile: path)) }
        return Item(id: path, title: name, icon: .image(icons[path]!)) { [weak self] in
          NSWorkspace.shared.openApplication(at: URL(fileURLWithPath: path), configuration: .init())
          self?.remember(path)
        }
      }
    }
  }

  var recent: [String] { UserDefaults.standard.stringArray(forKey: "recent") ?? [] }
  func remember(_ path: String) {
    UserDefaults.standard.set(Array(([path] + recent.filter { $0 != path }).prefix(3)), forKey: "recent")
  }

  func refresh() {
    let q = query.trimmingCharacters(in: .whitespaces)
    sel = 0
    if q.isEmpty {
      results = recent.compactMap { p in apps.first { $0.id == p } } + menu
      return
    }
    let hits = (apps + commands).compactMap { i in score(q, i.title).map { (i, $0) } }.sorted { $0.1 > $1.1 }.map(\.0)
    let enc = q.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? q
    let isURL = !q.contains(" ") && q.contains(".")
    let web = Item(id: "web", title: isURL ? "Open \(q)" : "Search: \(q)",
                   icon: .sprite(isURL ? "icon_desktop_internet" : "icon_desktop_egosearch", tint: false)) {
      sh("open '\(isURL ? (q.hasPrefix("http") ? q : "https://" + q) : "https://www.google.com/search?q=" + enc)'")
    }
    results = Array(hits.prefix(ROWS - 1)) + [web]
  }

  func run(_ i: Int) {
    guard results.indices.contains(i) else { return }
    let item = results[i]
    hide()
    item.run()
  }

  func move(_ d: Int) {
    guard !results.isEmpty else { return }
    sel = (sel + d + results.count) % results.count
  }
}

struct SearchField: NSViewRepresentable {
  @Binding var text: String
  func makeNSView(context: Context) -> NSTextField {
    let f = NSTextField()
    f.isBordered = false
    f.drawsBackground = false
    f.focusRingType = .none
    f.font = NSFont(name: "PixelMplus10-Regular", size: 20)
    f.textColor = NSColor(ink)
    f.placeholderAttributedString = NSAttributedString(string: "Search...", attributes: [
      .font: NSFont(name: "PixelMplus10-Regular", size: 20)!, .foregroundColor: NSColor(lilac),
    ])
    f.delegate = context.coordinator
    return f
  }
  func updateNSView(_ f: NSTextField, context: Context) { if f.stringValue != text { f.stringValue = text } }
  func makeCoordinator() -> Coordinator { Coordinator(self) }
  final class Coordinator: NSObject, NSTextFieldDelegate {
    let parent: SearchField
    init(_ p: SearchField) { parent = p }
    func controlTextDidChange(_ n: Notification) { parent.text = (n.object as! NSTextField).stringValue }
    func controlTextDidBeginEditing(_ n: Notification) {
      ((n.object as! NSTextField).currentEditor() as? NSTextView)?.insertionPointColor = NSColor(ink)
    }
  }
}

struct IconView: View {
  let icon: Item.Icon
  let selected: Bool
  var body: some View {
    switch icon {
    case let .sprite(n, tint):
      if tint {
        Image(nsImage: sprite(n)).renderingMode(.template).interpolation(.none).resizable().scaledToFit()
          .foregroundColor(selected ? .white : ink)
      } else {
        Image(nsImage: sprite(n)).interpolation(.none).resizable().scaledToFit()
      }
    case let .image(img):
      Image(nsImage: img).interpolation(.none).resizable().scaledToFit()
    }
  }
}

struct MenuView: View {
  @ObservedObject var m: Model
  var body: some View {
    VStack(alignment: .leading, spacing: 6) {
      SearchField(text: $m.query)
        .frame(height: 24)
        .padding(.horizontal, 10).padding(.vertical, 8)
        .background(Image(nsImage: sprite("InputFieldBackground")).interpolation(.none)
          .resizable(capInsets: EdgeInsets(top: 8, leading: 8, bottom: 8, trailing: 8)))
      ForEach(Array(m.results.enumerated()), id: \.element.id) { i, item in
        HStack(spacing: 10) {
          IconView(icon: item.icon, selected: i == m.sel).frame(width: 32, height: 32)
          Text(item.title).font(pixel("PixelMplus10-Regular", size: 20)).lineLimit(1)
            .foregroundColor(i == m.sel ? .white : ink)
          Spacer(minLength: 0)
        }
        .padding(.horizontal, 6).frame(height: ROW)
        .background(i == m.sel ? Image(nsImage: sprite("button_startmenu_selected")).interpolation(.none)
          .resizable(capInsets: EdgeInsets(top: 4, leading: 4, bottom: 6, trailing: 6)) : nil)
        .contentShape(Rectangle())
        .onHover { if $0 { m.sel = i } }
        .onTapGesture { m.run(i) }
      }
      Spacer(minLength: 0)
    }
    .padding(.leading, 22).padding(.trailing, 10).padding(.vertical, 10)
    .frame(width: W, height: 64 + CGFloat(ROWS) * (ROW + 6))
    .background(Image(nsImage: sprite("start_menu")).interpolation(.none)
      .resizable(capInsets: EdgeInsets(top: 4, leading: 14, bottom: 4, trailing: 4)))
    .background(lilac.offset(x: 4, y: 4))
    .padding(.trailing, 4).padding(.bottom, 4)
  }
}

final class Panel: NSPanel {
  override var canBecomeKey: Bool { true }
}

final class App: NSObject, NSApplicationDelegate {
  let model = Model()
  var panel: Panel!
  var hotkey: EventHotKeyRef?
  var previous: NSRunningApplication?

  func applicationDidFinishLaunching(_ n: Notification) {
    editMenu()
    let view = NSHostingView(rootView: MenuView(m: model))
    view.frame.size = view.fittingSize
    panel = Panel(contentRect: NSRect(origin: .zero, size: view.frame.size),
                  styleMask: [.borderless, .nonactivatingPanel], backing: .buffered, defer: false)
    panel.contentView = view
    panel.isOpaque = false
    panel.backgroundColor = .clear
    panel.hasShadow = false
    panel.level = .popUpMenu
    panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .transient]
    model.hide = { [weak self] in self?.hide() }
    model.scan()
    NotificationCenter.default.addObserver(forName: NSApplication.didResignActiveNotification, object: nil, queue: .main) { [weak self] _ in
      self?.hide()
    }
    DistributedNotificationCenter.default().addObserver(forName: toggleNote, object: nil, queue: .main) { [weak self] _ in
      self?.toggle()
    }
    NSEvent.addLocalMonitorForEvents(matching: .keyDown) { [weak self] e in
      guard let self, self.panel.isVisible else { return e }
      switch Int(e.keyCode) {
      case kVK_Escape: self.hide(restore: true)
      case kVK_DownArrow: self.model.move(1)
      case kVK_UpArrow: self.model.move(-1)
      case kVK_Return, kVK_ANSI_KeypadEnter: self.model.run(self.model.sel)
      default: return e
      }
      return nil
    }
    registerHotkey()
  }

  // Accessory apps get no menu bar, so ⌘A ⌘C ⌘V ⌘X ⌘Z need a hidden Edit menu to reach the search field.
  func editMenu() {
    let edit = NSMenu(title: "Edit")
    for (t, s, k) in [("Undo", "undo:", "z"), ("Redo", "redo:", "Z"), ("Cut", "cut:", "x"), ("Copy", "copy:", "c"),
                      ("Paste", "paste:", "v"), ("Select All", "selectAll:", "a")] {
      edit.addItem(withTitle: t, action: Selector(s), keyEquivalent: k)
    }
    let item = NSMenuItem()
    item.submenu = edit
    NSApp.mainMenu = NSMenu()
    NSApp.mainMenu!.addItem(item)
  }

  func registerHotkey() {
    var spec = EventTypeSpec(eventClass: OSType(kEventClassKeyboard), eventKind: UInt32(kEventHotKeyPressed))
    InstallEventHandler(GetApplicationEventTarget(), { _, _, _ in
      DispatchQueue.main.async { (NSApp.delegate as? App)?.toggle() }
      return noErr
    }, 1, &spec, nil, nil)
    let status = RegisterEventHotKey(UInt32(kVK_Space), UInt32(optionKey), EventHotKeyID(signature: 0x4E53_4F31, id: 1),
                                     GetApplicationEventTarget(), 0, &hotkey)
    if status != noErr { NSLog("Windose Start: ⌥Space is taken (\(status))") }
  }

  func toggle() { panel.isVisible ? hide(restore: true) : show() }

  func show() {
    model.scan()
    model.query = ""
    model.refresh()
    let screen = NSScreen.screens.first { NSMouseInRect(NSEvent.mouseLocation, $0.frame, false) } ?? NSScreen.main!
    let f = screen.frame
    panel.setFrameOrigin(NSPoint(x: f.minX + 4, y: f.maxY - TOP - 2 - panel.frame.height))
    previous = NSWorkspace.shared.frontmostApplication
    NSApp.activate(ignoringOtherApps: true)
    panel.makeKeyAndOrderFront(nil)
    if let field = findField(panel.contentView) { panel.makeFirstResponder(field) }
  }

  // Closing it (esc, START, ⌥Space) hands focus back to the app it opened over; launching something or clicking away does not.
  func hide(restore: Bool = false) {
    guard panel.isVisible else { return }
    panel.orderOut(nil)
    if restore, let p = previous, p != NSRunningApplication.current { p.activate() }
    previous = nil
  }

  func findField(_ v: NSView?) -> NSTextField? {
    guard let v else { return nil }
    if let f = v as? NSTextField, f.isEditable { return f }
    for s in v.subviews { if let f = findField(s) { return f } }
    return nil
  }
}

if CommandLine.arguments.contains("--toggle") {
  DistributedNotificationCenter.default().postNotificationName(toggleNote, object: nil, deliverImmediately: true)
  exit(0)
}
let app = NSApplication.shared
let delegate = App()
app.delegate = delegate
app.setActivationPolicy(.accessory)
app.run()
