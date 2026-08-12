# Implementation Plan: Video Gallery Improvements, Shorts Detection, and Deactivated Videos Management

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement automated YouTube Shorts detection (`is_short`), soft-delete deactivation of missing YouTube videos, admin management controls for video state, and a two-tab frontend gallery ("Estudos Bíblicos" vs "Shorts & Cortes").

**Architecture:** Extend FastAPI models and YouTube sync to fetch duration details via YouTube API v3 and set `is_short` and `is_active`. Add `is_short` query filter to `/videos/` endpoint and CRUD endpoints in `/admin/videos/`. On Angular 19 frontend, add a signal-driven tab selector (`'long'` vs `'shorts'`) with 16:9 and 9:16 aspect ratio grids, plus an admin video toggle view.

**Tech Stack:** Python 3.11, FastAPI, Google Cloud Firestore, YouTube Data API v3, Angular 19 (Signals, Standalone Components, Lucide Icons, Tailwind CSS), Karma/Jasmine, Pytest.

## Global Constraints

- Backend models use Pydantic `BaseModel` with `from_attributes = True`.
- Frontend uses Angular 19 signals (`signal`, `computed`) and standalone components.
- Tests must pass for both backend (`pytest`) and frontend (`ng test --watch=false`).

---

### Task 1: Backend Model & YouTube Sync Improvements

**Files:**
- Modify: `backend/models.py:10-30`
- Modify: `backend/services/youtube_sync.py:25-140`
- Test: `backend/tests/test_youtube_sync.py`

**Interfaces:**
- Consumes: YouTube Data API v3 (`channels`, `playlistItems`, `videos` endpoint)
- Produces: Updated `Video` model with `is_short: bool`, updated `sync_videos()` that auto-deactivates missing YouTube videos.

- [ ] **Step 1: Write the failing backend test for model and sync**

Create `backend/tests/test_youtube_sync.py`:
```python
import pytest
from models import Video

def test_video_model_has_is_short():
    v = Video(
        id="test_id",
        title="Test Short",
        url="https://youtube.com/shorts/test_id",
        is_short=True,
        is_active=True,
        author="Lamed",
        created_at="2026-08-12T10:00:00Z",
        updated_at="2026-08-12T10:00:00Z"
    )
    assert v.is_short is True
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_youtube_sync.py`
Expected: FAIL due to unexpected keyword argument `is_short`.

- [ ] **Step 3: Update `VideoBase` and `Video` models in `backend/models.py`**

Modify `backend/models.py`:
```python
class VideoBase(BaseModel):
    title: str
    description: Optional[str] = None
    url: str
    provider: Literal['youtube', 'storage'] = 'youtube'
    thumbnail_url: Optional[str] = None
    published_at: Optional[datetime] = None
    is_active: bool = True
    is_short: bool = False
    author: str = "Lamed"
```

- [ ] **Step 4: Update `youtube_sync.py` to fetch video details and detect Shorts & deactivations**

In `backend/services/youtube_sync.py`:
1. Use `service.videos().list(part="contentDetails,snippet", id=video_ids_str)` to retrieve `duration`.
2. Parse ISO 8601 duration string (e.g. `PT45S`, `PT1M`). If total seconds $\le 60$ or title/URL contains `shorts`, set `is_short = True`.
3. During sync, query active YouTube videos in Firestore. For any video whose ID is not in the latest YouTube response list, update `is_active = False`.

- [ ] **Step 5: Run test to verify it passes**

Run: `pytest backend/tests/test_youtube_sync.py`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add backend/models.py backend/services/youtube_sync.py backend/tests/test_youtube_sync.py
git commit -m "feat(backend): add is_short field and auto-deactivation of deleted videos in youtube sync"
```

---

### Task 2: Backend API Routes for Video Filtering & Admin Management

**Files:**
- Modify: `backend/routes/videos.py:40-77`
- Modify: `backend/routes/admin.py:40-46`
- Test: `backend/tests/test_videos_api.py`

**Interfaces:**
- Consumes: Updated `Video` model from `backend/models.py`
- Produces: `GET /videos/?is_short=true|false`, `PATCH /admin/videos/{video_id}`

- [ ] **Step 1: Write failing test for video filtering**

In `backend/tests/test_videos_api.py`:
```python
def test_get_videos_filter_is_short(client):
    response = client.get("/videos/?is_short=true")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
```

- [ ] **Step 2: Run test to verify failure or missing parameter**

Run: `pytest backend/tests/test_videos_api.py`

- [ ] **Step 3: Update `get_videos` in `backend/routes/videos.py`**

In `backend/routes/videos.py`:
```python
@router.get("/", response_model=List[Video])
def get_videos(
    limit: int = 50,
    start_after_id: Optional[str] = None,
    only_active: bool = True,
    is_short: Optional[bool] = None,
):
    query = db.collection(VIDEOS_COLLECTION)
    if only_active:
        query = query.where(filter=FieldFilter("is_active", "==", True))
    if is_short is not None:
        query = query.where(filter=FieldFilter("is_short", "==", is_short))
    query = query.order_by("published_at", direction=FirestoreQuery.DESCENDING)
    ...
```

- [ ] **Step 4: Add admin routes in `backend/routes/admin.py`**

In `backend/routes/admin.py`:
```python
@router.patch("/videos/{video_id}")
def update_video_status(video_id: str, is_active: Optional[bool] = None, is_short: Optional[bool] = None, _admin=Depends(get_admin)):
    doc_ref = db.collection("videos").document(video_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Video not found")
    updates = {}
    if is_active is not None:
        updates["is_active"] = is_active
    if is_short is not None:
        updates["is_short"] = is_short
    if updates:
        doc_ref.update(updates)
    return {"status": "success", "id": video_id, "updated": updates}
```

- [ ] **Step 5: Run tests and verify PASS**

Run: `pytest backend/tests/test_videos_api.py`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add backend/routes/videos.py backend/routes/admin.py backend/tests/test_videos_api.py
git commit -m "feat(backend): add is_short query filter and admin video status update endpoint"
```

---

### Task 3: Frontend Services Update

**Files:**
- Modify: `frontend/src/app/services/video.service.ts`
- Modify: `frontend/src/app/services/videos.service.ts`
- Test: `frontend/src/app/services/videos.service.spec.ts`

**Interfaces:**
- Consumes: Backend API `/videos/?is_short=...`
- Produces: `VideoService.getVideos(limit, startAfterId, onlyActive, isShort)` and `VideosService.getVideos(isShort)`

- [ ] **Step 1: Write failing frontend service test**

In `frontend/src/app/services/videos.service.spec.ts`:
```ts
it('should request shorts when isShort is true', (done) => {
  videosService.getVideos(true).subscribe(videos => {
    expect(videos).toBeDefined();
    done();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm --prefix frontend test -- --watch=false`

- [ ] **Step 3: Update `VideoService` & `VideosService`**

In `frontend/src/app/services/video.service.ts`:
Add `is_short?: boolean` to `Video` interface.
Update `getVideos(limit = 50, startAfterId?: string, onlyActive = true, isShort?: boolean)`:
```ts
if (isShort !== undefined) {
  params.is_short = isShort;
}
```

In `frontend/src/app/services/videos.service.ts`:
Update `getVideos(isShort: boolean = false)`:
Pass `isShort` to `this.videoService.getVideos(50, undefined, true, isShort)`.

- [ ] **Step 4: Run tests to verify PASS**

Run: `npm --prefix frontend test -- --watch=false`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/services/video.service.ts frontend/src/app/services/videos.service.ts frontend/src/app/services/videos.service.spec.ts
git commit -m "feat(frontend): update video services to support is_short parameter"
```

---

### Task 4: Frontend Public Videos Component with Tab Control

**Files:**
- Modify: `frontend/src/app/componentes/videos/videos.ts`
- Modify: `frontend/src/app/componentes/videos/videos.html`
- Modify: `frontend/src/app/componentes/videos/videos.spec.ts`

**Interfaces:**
- Consumes: `VideosService.getVideos(isShort)`
- Produces: Interactive tab navigation ("Estudos Bíblicos" vs "Shorts & Cortes") with 16:9 and 9:16 video grids.

- [ ] **Step 1: Write failing component test**

In `frontend/src/app/componentes/videos/videos.spec.ts`:
```ts
it('should switch activeTab when setTab is called', () => {
  component.setTab('shorts');
  expect(component.activeTab()).toBe('shorts');
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm --prefix frontend test -- --watch=false`

- [ ] **Step 3: Update `Videos` component class and template**

In `frontend/src/app/componentes/videos/videos.ts`:
Add `activeTab = signal<'long' | 'shorts'>('long');`
Add `setTab(tab: 'long' | 'shorts')` method that reloads `videos$` signal or observable.

In `frontend/src/app/componentes/videos/videos.html`:
Add tab buttons:
- "Estudos Bíblicos" (icon `book-open` / `play-circle`)
- "Shorts & Cortes" (icon `video` / `smartphone`)
For `shorts` tab, render cards with `aspect-[9/16] max-w-[280px] mx-auto`.

- [ ] **Step 4: Run tests to verify PASS**

Run: `npm --prefix frontend test -- --watch=false`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/componentes/videos/videos.ts frontend/src/app/componentes/videos/videos.html frontend/src/app/componentes/videos/videos.spec.ts
git commit -m "feat(frontend): add tabs for long videos vs shorts in video gallery"
```

---

### Task 5: Frontend Admin Video Management View

**Files:**
- Create: `frontend/src/app/admin/videos/admin-videos.component.ts`
- Create: `frontend/src/app/admin/videos/admin-videos.component.html`
- Create: `frontend/src/app/admin/videos/admin-videos.component.spec.ts`
- Modify: `frontend/src/app/admin/admin.routes.ts`

**Interfaces:**
- Consumes: `VideoService.getVideos(100, undefined, false)` and `http.patch('/api/admin/videos/:id')`
- Produces: Administrative table to toggle video `is_active` status and trigger YouTube sync manually.

- [ ] **Step 1: Create `admin-videos.component.ts` and `admin-videos.component.html`**

Create component that lists all videos, displays status badges, toggle switches for `is_active`, and a "Sincronizar YouTube" button.

- [ ] **Step 2: Register route in `frontend/src/app/admin/admin.routes.ts`**

Add path `'videos'` pointing to `AdminVideosComponent`.

- [ ] **Step 3: Write component unit test in `admin-videos.component.spec.ts`**

Verify that toggle method calls `VideoService` or `HttpClient` to update status.

- [ ] **Step 4: Run tests to verify PASS**

Run: `npm --prefix frontend test -- --watch=false`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/admin/videos/ frontend/src/app/admin/admin.routes.ts
git commit -m "feat(admin): add admin video management component for status toggle and sync"
```
