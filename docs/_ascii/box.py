"""Fixed-width ASCII frame helper for the screen designs in
RND-GEOFENCE-ATTENDANCE.md §5. Keeping this in the repo means the screens can be
regenerated instead of hand-aligned. Avoid emoji - they are double-width and
break the frame."""
W = 106  # inner width
def rule(l='├', m='─', r='┤'): return l + m*W + r
def row(s=''):
    s = s.rstrip('\n')
    if len(s) > W: s = s[:W]
    return '│' + s.ljust(W) + '│'
def top(): return '┌' + '─'*W + '┐'
def bot(): return '└' + '─'*W + '┘'
def cols(widths, cells, sep='│'):
    out=[]
    for wdt, c in zip(widths, cells):
        c = str(c)
        if len(c) > wdt: c = c[:wdt]
        out.append(c.ljust(wdt))
    return '│' + sep.join(out) + '│'
def crule(widths, l='├', j='┼', r='┤'):
    return l + j.join('─'*w for w in widths) + r
def check(widths):
    """pad/trim the LAST column so the grid always matches the frame"""
    tot = sum(widths) + len(widths) - 1
    widths[-1] += (W - tot)
    assert widths[-1] > 0, 'columns overflow the frame'
    return widths
