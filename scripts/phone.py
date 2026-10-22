"""ADB-only verification helper. Operates only on the explicitly selected device."""
import argparse, re, shlex, subprocess, time, xml.etree.ElementTree as ET
from pathlib import Path
SERIAL='82f1c8d5'
ROOT=Path(__file__).resolve().parents[1]
def adb(*args):
 return subprocess.check_output(['adb','-s',SERIAL,*args])
def shell(command): return adb('shell',command)
def nodes():
 shell('uiautomator dump /sdcard/stillform-ui.xml >/dev/null')
 raw=shell('cat /sdcard/stillform-ui.xml').decode()
 return list(ET.fromstring(raw).iter('node'))
def find(selector):
 return next((n for n in nodes() if n.get('content-desc')==selector or n.get('resource-id')==selector or n.get('text')==selector),None)
def keyboard_shown():
 return 'mInputShown=true' in shell('dumpsys input_method').decode()
def tap(selector,scroll=True):
 for attempt in range(8 if scroll else 1):
  n=find(selector)
  if n is not None:
   x1,y1,x2,y2=map(int,re.findall(r'\d+',n.get('bounds','')))
   if y2>y1 and x2>x1 and (not keyboard_shown() or (y1+y2)//2<1320):
    shell(f'input tap {(x1+x2)//2} {(y1+y2)//2}');time.sleep(.6);return
  shell('input swipe 540 1150 540 500 350' if keyboard_shown() else 'input swipe 540 1800 540 650 350');time.sleep(.4)
 raise RuntimeError('Control not found: '+selector)
def fill(selector,value,clear=False):
 if keyboard_shown():shell('input keyevent 4')
 tap(selector)
 if clear:
  shell('input keyevent 123');shell('input keyevent '+' '.join(['67']*100))
 shell('input text '+shlex.quote(value.replace(' ','%s')));time.sleep(.3)
def screenshot(name):
 (ROOT/'design/screenshots'/f'{name}.png').write_bytes(adb('exec-out','screencap','-p'))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('action',choices=['dump','tap','fill','shot','shell']);p.add_argument('value',nargs='?');p.add_argument('text',nargs='?');p.add_argument('--clear',action='store_true');a=p.parse_args()
 if a.action=='dump':
  for n in nodes():
   if n.get('text') or n.get('content-desc'):print(n.get('class'),repr(n.get('text')),repr(n.get('content-desc')),n.get('bounds'))
 elif a.action=='tap':tap(a.value)
 elif a.action=='fill':fill(a.value,a.text,a.clear)
 elif a.action=='shot':screenshot(a.value)
 else:print(shell(a.value).decode())
