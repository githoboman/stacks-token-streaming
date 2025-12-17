;; title: stream-analytics
;; version: 1.0
;; summary: Track metrics and reputation for token streaming
;; description: Analytics contract to track stream metrics, user reputation, and network statistics

;; traits
;;

;; constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_INVALID_STREAM_ID (err u101))
(define-constant ERR_ALREADY_RECORDED (err u102))
(define-constant ERR_STREAM_NOT_FOUND (err u103))
(define-constant ERR_INVALID_RATING (err u104))

;; data vars
(define-data-var total-streams-created uint u0)
(define-data-var total-volume-streamed uint u0)
(define-data-var total-streams-completed uint u0)
(define-data-var total-streams-cancelled uint u0)

;; data maps

;; Track individual stream metrics
(define-map stream-records
  uint ;; stream-id
  {
    sender: principal,
    recipient: principal,
    total-amount: uint,
    amount-withdrawn: uint,
    start-block: uint,
    end-block: uint,
    created-at-block: uint,
    completed: bool,
    cancelled: bool
  }
)

;; Track sender metrics and reputation
(define-map sender-stats
  principal
  {
    total-streams-created: uint,
    total-amount-sent: uint,
    streams-completed: uint,
    streams-cancelled: uint,
    average-stream-duration: uint,
    reputation-score: uint, ;; 0-100 scale
    total-ratings-received: uint,
    rating-sum: uint
  }
)

;; Track recipient metrics
(define-map recipient-stats
  principal
  {
    total-streams-received: uint,
    total-amount-received: uint,
    total-withdrawn: uint,
    streams-completed: uint,
    average-withdrawal-frequency: uint,
    reputation-score: uint,
    total-ratings-received: uint,
    rating-sum: uint
  }
)

;; Track ratings given by users
(define-map user-ratings
  { rater: principal, rated: principal, stream-id: uint }
  {
    rating: uint, ;; 1-5 stars
    timestamp: uint
  }
)

;; Track top performers (leaderboards)
(define-map sender-leaderboard
  uint ;; rank (1-100)
  { principal: principal, volume: uint }
)

(define-map recipient-leaderboard
  uint ;; rank (1-100)
  { principal: principal, volume: uint }
)

;; Track historical metrics by time period
(define-map period-metrics
  uint ;; period-id (block-height / 2016 for ~2 weeks)
  {
    streams-created: uint,
    total-volume: uint,
    unique-senders: uint,
    unique-recipients: uint
  }
)

;; public functions

;; Record a new stream creation
(define-public (record-stream-creation
    (stream-id uint)
    (sender principal)
    (recipient principal)
    (total-amount uint)
    (start-block uint)
    (end-block uint)
  )
  (begin
    ;; Only the stream contract should call this
    (asserts! (is-eq contract-caller CONTRACT_OWNER) ERR_UNAUTHORIZED)

    ;; Check if stream already recorded
    (asserts! (is-none (map-get? stream-records stream-id)) ERR_ALREADY_RECORDED)

    ;; Record stream details
    (map-set stream-records stream-id {
      sender: sender,
      recipient: recipient,
      total-amount: total-amount,
      amount-withdrawn: u0,
      start-block: start-block,
      end-block: end-block,
      created-at-block: block-height,
      completed: false,
      cancelled: false
    })

    ;; Update sender stats
    (update-sender-stats-on-creation sender total-amount)

    ;; Update recipient stats
    (update-recipient-stats-on-creation recipient)

    ;; Update global metrics
    (var-set total-streams-created (+ (var-get total-streams-created) u1))
    (var-set total-volume-streamed (+ (var-get total-volume-streamed) total-amount))

    ;; Update period metrics
    (update-period-metrics total-amount)

    (ok true)
  )
)

;; Record a withdrawal from a stream
(define-public (record-withdrawal
    (stream-id uint)
    (amount uint)
  )
  (let (
    (stream (unwrap! (map-get? stream-records stream-id) ERR_STREAM_NOT_FOUND))
  )
    (asserts! (is-eq contract-caller CONTRACT_OWNER) ERR_UNAUTHORIZED)

    ;; Update stream record
    (map-set stream-records stream-id
      (merge stream {
        amount-withdrawn: (+ (get amount-withdrawn stream) amount)
      })
    )

    ;; Update recipient stats
    (update-recipient-stats-on-withdrawal (get recipient stream) amount)

    (ok true)
  )
)

;; Record stream completion
(define-public (record-stream-completion
    (stream-id uint)
  )
  (let (
    (stream (unwrap! (map-get? stream-records stream-id) ERR_STREAM_NOT_FOUND))
  )
    (asserts! (is-eq contract-caller CONTRACT_OWNER) ERR_UNAUTHORIZED)

    ;; Update stream record
    (map-set stream-records stream-id
      (merge stream { completed: true })
    )

    ;; Update sender stats
    (update-sender-completion-stats (get sender stream))

    ;; Update recipient stats
    (update-recipient-completion-stats (get recipient stream))

    ;; Update global metrics
    (var-set total-streams-completed (+ (var-get total-streams-completed) u1))

    (ok true)
  )
)

;; Record stream cancellation
(define-public (record-stream-cancellation
    (stream-id uint)
  )
  (let (
    (stream (unwrap! (map-get? stream-records stream-id) ERR_STREAM_NOT_FOUND))
  )
    (asserts! (is-eq contract-caller CONTRACT_OWNER) ERR_UNAUTHORIZED)

    ;; Update stream record
    (map-set stream-records stream-id
      (merge stream { cancelled: true })
    )

    ;; Update sender stats
    (update-sender-cancellation-stats (get sender stream))

    ;; Update global metrics
    (var-set total-streams-cancelled (+ (var-get total-streams-cancelled) u1))

    (ok true)
  )
)

;; Rate a user after stream completion
(define-public (rate-user
    (rated principal)
    (stream-id uint)
    (rating uint)
  )
  (let (
    (stream (unwrap! (map-get? stream-records stream-id) ERR_STREAM_NOT_FOUND))
    (rater contract-caller)
  )
    ;; Validate rating (1-5 stars)
    (asserts! (and (>= rating u1) (<= rating u5)) ERR_INVALID_RATING)

    ;; Verify rater is part of the stream
    (asserts!
      (or
        (is-eq rater (get sender stream))
        (is-eq rater (get recipient stream))
      )
      ERR_UNAUTHORIZED
    )

    ;; Verify rated user is part of the stream
    (asserts!
      (or
        (is-eq rated (get sender stream))
        (is-eq rated (get recipient stream))
      )
      ERR_UNAUTHORIZED
    )

    ;; Verify stream is completed
    (asserts! (get completed stream) ERR_UNAUTHORIZED)

    ;; Record rating
    (map-set user-ratings
      { rater: rater, rated: rated, stream-id: stream-id }
      { rating: rating, timestamp: block-height }
    )

    ;; Update reputation score
    (update-reputation-score rated rating)

    (ok true)
  )
)

;; read only functions

;; Get global statistics
(define-read-only (get-global-stats)
  {
    total-streams: (var-get total-streams-created),
    total-volume: (var-get total-volume-streamed),
    completed-streams: (var-get total-streams-completed),
    cancelled-streams: (var-get total-streams-cancelled),
    completion-rate: (calculate-completion-rate),
    average-stream-size: (calculate-average-stream-size)
  }
)

;; Get sender statistics
(define-read-only (get-sender-stats (sender principal))
  (default-to
    {
      total-streams-created: u0,
      total-amount-sent: u0,
      streams-completed: u0,
      streams-cancelled: u0,
      average-stream-duration: u0,
      reputation-score: u50, ;; default to 50/100
      total-ratings-received: u0,
      rating-sum: u0
    }
    (map-get? sender-stats sender)
  )
)

;; Get recipient statistics
(define-read-only (get-recipient-stats (recipient principal))
  (default-to
    {
      total-streams-received: u0,
      total-amount-received: u0,
      total-withdrawn: u0,
      streams-completed: u0,
      average-withdrawal-frequency: u0,
      reputation-score: u50,
      total-ratings-received: u0,
      rating-sum: u0
    }
    (map-get? recipient-stats recipient)
  )
)

;; Get stream record
(define-read-only (get-stream-record (stream-id uint))
  (map-get? stream-records stream-id)
)

;; Get user rating for a specific stream
(define-read-only (get-rating (rater principal) (rated principal) (stream-id uint))
  (map-get? user-ratings { rater: rater, rated: rated, stream-id: stream-id })
)

;; Calculate sender reliability score (0-100)
(define-read-only (calculate-sender-reliability (sender principal))
  (let (
    (stats (get-sender-stats sender))
    (total-streams (get total-streams-created stats))
  )
    (if (is-eq total-streams u0)
      u50 ;; default score
      (let (
        (completion-rate (/ (* (get streams-completed stats) u100) total-streams))
        (cancellation-penalty (/ (* (get streams-cancelled stats) u20) total-streams))
      )
        (if (> completion-rate cancellation-penalty)
          (- completion-rate cancellation-penalty)
          u0
        )
      )
    )
  )
)

;; Calculate recipient engagement score (0-100)
(define-read-only (calculate-recipient-engagement (recipient principal))
  (let (
    (stats (get-recipient-stats recipient))
    (total-received (get total-amount-received stats))
    (total-withdrawn (get total-withdrawn stats))
  )
    (if (is-eq total-received u0)
      u50
      (/ (* total-withdrawn u100) total-received)
    )
  )
)

;; Get period metrics
(define-read-only (get-period-metrics (period-id uint))
  (default-to
    {
      streams-created: u0,
      total-volume: u0,
      unique-senders: u0,
      unique-recipients: u0
    }
    (map-get? period-metrics period-id)
  )
)

;; Get current period ID (2016 blocks ~2 weeks)
(define-read-only (get-current-period)
  (/ block-height u2016)
)

;; Get leaderboard entry
(define-read-only (get-sender-rank (rank uint))
  (map-get? sender-leaderboard rank)
)

(define-read-only (get-recipient-rank (rank uint))
  (map-get? recipient-leaderboard rank)
)

;; private functions

;; Update sender stats on stream creation
(define-private (update-sender-stats-on-creation (sender principal) (amount uint))
  (let (
    (current-stats (get-sender-stats sender))
  )
    (map-set sender-stats sender
      (merge current-stats {
        total-streams-created: (+ (get total-streams-created current-stats) u1),
        total-amount-sent: (+ (get total-amount-sent current-stats) amount)
      })
    )
  )
)

;; Update recipient stats on stream creation
(define-private (update-recipient-stats-on-creation (recipient principal))
  (let (
    (current-stats (get-recipient-stats recipient))
  )
    (map-set recipient-stats recipient
      (merge current-stats {
        total-streams-received: (+ (get total-streams-received current-stats) u1)
      })
    )
  )
)

;; Update recipient stats on withdrawal
(define-private (update-recipient-stats-on-withdrawal (recipient principal) (amount uint))
  (let (
    (current-stats (get-recipient-stats recipient))
  )
    (map-set recipient-stats recipient
      (merge current-stats {
        total-amount-received: (+ (get total-amount-received current-stats) amount),
        total-withdrawn: (+ (get total-withdrawn current-stats) amount)
      })
    )
  )
)

;; Update sender completion stats
(define-private (update-sender-completion-stats (sender principal))
  (let (
    (current-stats (get-sender-stats sender))
  )
    (map-set sender-stats sender
      (merge current-stats {
        streams-completed: (+ (get streams-completed current-stats) u1)
      })
    )
  )
)

;; Update recipient completion stats
(define-private (update-recipient-completion-stats (recipient principal))
  (let (
    (current-stats (get-recipient-stats recipient))
  )
    (map-set recipient-stats recipient
      (merge current-stats {
        streams-completed: (+ (get streams-completed current-stats) u1)
      })
    )
  )
)

;; Update sender cancellation stats
(define-private (update-sender-cancellation-stats (sender principal))
  (let (
    (current-stats (get-sender-stats sender))
  )
    (map-set sender-stats sender
      (merge current-stats {
        streams-cancelled: (+ (get streams-cancelled current-stats) u1)
      })
    )
  )
)

;; Update reputation score based on new rating
(define-private (update-reputation-score (user principal) (new-rating uint))
  (let (
    (is-sender (is-some (map-get? sender-stats user)))
    (current-stats (if is-sender
      (get-sender-stats user)
      (get-recipient-stats user)
    ))
    (current-sum (get rating-sum current-stats))
    (current-count (get total-ratings-received current-stats))
    (new-sum (+ current-sum new-rating))
    (new-count (+ current-count u1))
    ;; Calculate new reputation (rating average * 20 to get 0-100 scale)
    (new-reputation (/ (* new-sum u20) new-count))
  )
    (if is-sender
      (map-set sender-stats user
        (merge current-stats {
          reputation-score: new-reputation,
          total-ratings-received: new-count,
          rating-sum: new-sum
        })
      )
      (map-set recipient-stats user
        (merge current-stats {
          reputation-score: new-reputation,
          total-ratings-received: new-count,
          rating-sum: new-sum
        })
      )
    )
  )
)

;; Update period metrics
(define-private (update-period-metrics (amount uint))
  (let (
    (period-id (get-current-period))
    (current-metrics (get-period-metrics period-id))
  )
    (map-set period-metrics period-id
      (merge current-metrics {
        streams-created: (+ (get streams-created current-metrics) u1),
        total-volume: (+ (get total-volume current-metrics) amount)
      })
    )
  )
)

;; Calculate global completion rate
(define-private (calculate-completion-rate)
  (let (
    (total (var-get total-streams-created))
    (completed (var-get total-streams-completed))
  )
    (if (is-eq total u0)
      u0
      (/ (* completed u100) total)
    )
  )
)

;; Calculate average stream size
(define-private (calculate-average-stream-size)
  (let (
    (total-streams (var-get total-streams-created))
    (total-volume (var-get total-volume-streamed))
  )
    (if (is-eq total-streams u0)
      u0
      (/ total-volume total-streams)
    )
  )
)