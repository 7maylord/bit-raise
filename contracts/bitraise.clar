;; ========================================
;; CONSTANTS
;; ========================================

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-CAMPAIGN-NOT-FOUND (err u101))
(define-constant ERR-CAMPAIGN-ENDED (err u102))
(define-constant ERR-CAMPAIGN-ACTIVE (err u103))
(define-constant ERR-INVALID-AMOUNT (err u104))
(define-constant ERR-GOAL-NOT-REACHED (err u105))
(define-constant ERR-ALREADY-WITHDRAWN (err u106))
(define-constant ERR-NO-PLEDGE-FOUND (err u107))
(define-constant ERR-ALREADY-REFUNDED (err u108))
(define-constant ERR-INVALID-DEADLINE (err u109))
(define-constant ERR-INVALID-GOAL (err u110))
(define-constant ERR-CONTRACT-PAUSED (err u111))
(define-constant ERR-TRANSFER-FAILED (err u112))
(define-constant ERR-INVALID-FEE (err u113))

;; Campaign states
(define-constant STATE-ACTIVE "active")
(define-constant STATE-SUCCESSFUL "successful")
(define-constant STATE-FAILED "failed")
(define-constant STATE-CANCELLED "cancelled")

;; Platform settings
(define-constant MIN-CAMPAIGN-DURATION u144) ;; ~1 day in blocks (10 min blocks)
(define-constant MAX-CAMPAIGN-DURATION u52560) ;; ~1 year in blocks
(define-constant PLATFORM-FEE-PERCENTAGE u2) ;; 2% platform fee
(define-constant MIN-GOAL u1000000) ;; 1 STX minimum goal (in micro-STX)

;; Contract owner
(define-constant CONTRACT-OWNER tx-sender)

;; ========================================
;; DATA VARIABLES
;; ========================================

(define-data-var campaign-nonce uint u0)
(define-data-var platform-fee-percentage uint PLATFORM-FEE-PERCENTAGE)
(define-data-var contract-paused bool false)
(define-data-var total-platform-fees uint u0)

;; ========================================
;; DATA MAPS
;; ========================================

;; Campaign data structure
(define-map campaigns
    { campaign-id: uint }
    {
        creator: principal,
        title: (string-utf8 100),
        description: (string-utf8 500),
        goal: uint,
        deadline: uint,
        total-pledged: uint,
        state: (string-ascii 10),
        metadata-uri: (string-ascii 256),
        withdrawn: bool,
        created-at: uint,
    }
)

;; Individual pledges
(define-map pledges
    {
        campaign-id: uint,
        backer: principal,
    }
    {
        amount: uint,
        refunded: bool,
        pledged-at: uint,
    }
)

;; Track all backers for a campaign (for iteration)
(define-map campaign-backers
    {
        campaign-id: uint,
        backer-index: uint,
    }
    { backer: principal }
)

;; Count of backers per campaign
(define-map campaign-backer-count
    { campaign-id: uint }
    { count: uint }
)

;; User's campaign list
(define-map user-campaigns
    {
        user: principal,
        campaign-index: uint,
    }
    { campaign-id: uint }
)

;; Count of campaigns per user
(define-map user-campaign-count
    { user: principal }
    { count: uint }
)

;; ========================================
;; PRIVATE FUNCTIONS
;; ========================================

(define-private (get-next-campaign-id)
    (let ((current-nonce (var-get campaign-nonce)))
        (var-set campaign-nonce (+ current-nonce u1))
        current-nonce
    )
)

(define-private (calculate-platform-fee (amount uint))
    ;; Safe fee calculation with overflow protection
    ;; Fee is capped at 10%, so max multiplication is amount * 10
    ;; Result will always fit in uint if amount fits in uint
    (/ (* amount (var-get platform-fee-percentage)) u100)
)

(define-private (add-backer-to-campaign
        (campaign-id uint)
        (backer principal)
    )
    (let ((current-count (default-to { count: u0 }
            (map-get? campaign-backer-count { campaign-id: campaign-id })
        )))
        (map-set campaign-backers {
            campaign-id: campaign-id,
            backer-index: (get count current-count),
        } { backer: backer }
        )
        (map-set campaign-backer-count { campaign-id: campaign-id } { count: (+ (get count current-count) u1) })
        true
    )
)

(define-private (add-campaign-to-user
        (user principal)
        (campaign-id uint)
    )
    (let ((current-count (default-to { count: u0 } (map-get? user-campaign-count { user: user }))))
        (map-set user-campaigns {
            user: user,
            campaign-index: (get count current-count),
        } { campaign-id: campaign-id }
        )
        (map-set user-campaign-count { user: user } { count: (+ (get count current-count) u1) })
        true
    )
)

;; ========================================
;; PUBLIC FUNCTIONS
;; ========================================

;; Create a new campaign
(define-public (create-campaign
        (title (string-utf8 100))
        (description (string-utf8 500))
        (goal uint)
        (duration uint)
        (metadata-uri (string-ascii 256))
    )
    (let (
            (campaign-id (get-next-campaign-id))
            (deadline (+ stacks-block-height duration))
        )
        ;; Validations
        (asserts! (not (var-get contract-paused)) ERR-CONTRACT-PAUSED)
        (asserts! (> (len title) u0) ERR-INVALID-AMOUNT) ;; Title cannot be empty
        (asserts! (> (len description) u0) ERR-INVALID-AMOUNT) ;; Description cannot be empty
        (asserts! (>= goal MIN-GOAL) ERR-INVALID-GOAL)
        (asserts! (>= duration MIN-CAMPAIGN-DURATION) ERR-INVALID-DEADLINE)
        (asserts! (<= duration MAX-CAMPAIGN-DURATION) ERR-INVALID-DEADLINE)

        ;; Create campaign
        (map-set campaigns { campaign-id: campaign-id } {
            creator: tx-sender,
            title: title,
            description: description,
            goal: goal,
            deadline: deadline,
            total-pledged: u0,
            state: STATE-ACTIVE,
            metadata-uri: metadata-uri,
            withdrawn: false,
            created-at: stacks-block-height,
        })

        ;; Add to user's campaign list
        (add-campaign-to-user tx-sender campaign-id)

        ;; Emit event via print
        (print {
            event: "campaign-created",
            campaign-id: campaign-id,
            creator: tx-sender,
            goal: goal,
            deadline: deadline,
        })

        (ok campaign-id)
    )
)

;; Pledge to a campaign
(define-public (pledge
        (campaign-id uint)
        (amount uint)
    )
    (let (
            (campaign (unwrap! (map-get? campaigns { campaign-id: campaign-id })
                ERR-CAMPAIGN-NOT-FOUND
            ))
            (existing-pledge (map-get? pledges {
                campaign-id: campaign-id,
                backer: tx-sender,
            }))
        )
        ;; Validations
        (asserts! (not (var-get contract-paused)) ERR-CONTRACT-PAUSED)
        (asserts! (> amount u0) ERR-INVALID-AMOUNT)
        ;; Allow pledges to active or successful campaigns (but not failed/cancelled)
        (asserts! (or
            (is-eq (get state campaign) STATE-ACTIVE)
            (is-eq (get state campaign) STATE-SUCCESSFUL)
        ) ERR-CAMPAIGN-ENDED)
        (asserts! (< stacks-block-height (get deadline campaign))
            ERR-CAMPAIGN-ENDED
        )

        ;; Transfer STX to contract
        (unwrap! (stx-transfer? amount tx-sender (as-contract tx-sender))
            ERR-TRANSFER-FAILED
        )

        ;; Update or create pledge
        (match existing-pledge
            existing-data
            ;; Update existing pledge
            (map-set pledges {
                campaign-id: campaign-id,
                backer: tx-sender,
            } {
                amount: (+ (get amount existing-data) amount),
                refunded: false,
                pledged-at: stacks-block-height,
            })
            ;; Create new pledge and add backer
            (begin
                (map-set pledges {
                    campaign-id: campaign-id,
                    backer: tx-sender,
                } {
                    amount: amount,
                    refunded: false,
                    pledged-at: stacks-block-height,
                })
                (add-backer-to-campaign campaign-id tx-sender)
            )
        )

        ;; Update campaign total and state if goal reached
        (let ((new-total (+ (get total-pledged campaign) amount)))
            (map-set campaigns { campaign-id: campaign-id }
                (if (>= new-total (get goal campaign))
                    ;; Goal reached - mark as successful if not already
                    (merge campaign {
                        total-pledged: new-total,
                        state: STATE-SUCCESSFUL
                    })
                    ;; Goal not reached yet - just update total
                    (merge campaign { total-pledged: new-total })
                )
            )
        )

        ;; Emit event
        (print {
            event: "pledge-received",
            campaign-id: campaign-id,
            backer: tx-sender,
            amount: amount,
            total-pledged: (+ (get total-pledged campaign) amount),
        })

        (ok true)
    )
)

;; Withdraw funds (creator only, after successful campaign)
(define-public (withdraw-funds (campaign-id uint))
    (let (
            (campaign (unwrap! (map-get? campaigns { campaign-id: campaign-id })
                ERR-CAMPAIGN-NOT-FOUND
            ))
            (total-pledged (get total-pledged campaign))
            (platform-fee (calculate-platform-fee total-pledged))
            (creator-amount (- total-pledged platform-fee))
        )
        ;; Validations
        (asserts! (is-eq tx-sender (get creator campaign)) ERR-NOT-AUTHORIZED)
        (asserts! (>= stacks-block-height (get deadline campaign))
            ERR-CAMPAIGN-ACTIVE
        )
        (asserts! (>= total-pledged (get goal campaign)) ERR-GOAL-NOT-REACHED)
        (asserts! (not (get withdrawn campaign)) ERR-ALREADY-WITHDRAWN)

        ;; Update campaign state
        (map-set campaigns { campaign-id: campaign-id }
            (merge campaign {
                state: STATE-SUCCESSFUL,
                withdrawn: true,
            })
        )

        ;; Transfer funds to creator (minus platform fee)
        (unwrap!
            (as-contract (stx-transfer? creator-amount tx-sender (get creator campaign)))
            ERR-TRANSFER-FAILED
        )

        ;; Update platform fees
        (var-set total-platform-fees
            (+ (var-get total-platform-fees) platform-fee)
        )

        ;; Emit event
        (print {
            event: "funds-withdrawn",
            campaign-id: campaign-id,
            creator: (get creator campaign),
            amount: creator-amount,
            platform-fee: platform-fee,
        })

        (ok creator-amount)
    )
)

;; Refund pledge (backer only, after failed campaign)
(define-public (refund (campaign-id uint))
    (let (
            (campaign (unwrap! (map-get? campaigns { campaign-id: campaign-id })
                ERR-CAMPAIGN-NOT-FOUND
            ))
            (user-pledge (unwrap!
                (map-get? pledges {
                    campaign-id: campaign-id,
                    backer: tx-sender,
                })
                ERR-NO-PLEDGE-FOUND
            ))
            (refund-amount (get amount user-pledge))
            (backer tx-sender)
        )
        ;; Validations
        (asserts! (>= stacks-block-height (get deadline campaign))
            ERR-CAMPAIGN-ACTIVE
        )
        (asserts! (< (get total-pledged campaign) (get goal campaign))
            ERR-GOAL-NOT-REACHED
        )
        (asserts! (not (get refunded user-pledge)) ERR-ALREADY-REFUNDED)

        ;; Update pledge as refunded
        (map-set pledges {
            campaign-id: campaign-id,
            backer: backer,
        }
            (merge user-pledge { refunded: true })
        )

        ;; Update campaign state if not already failed
        (if (is-eq (get state campaign) STATE-ACTIVE)
            (map-set campaigns { campaign-id: campaign-id }
                (merge campaign { state: STATE-FAILED })
            )
            true
        )

        ;; Transfer refund to backer
        (unwrap! (as-contract (stx-transfer? refund-amount tx-sender backer))
            ERR-TRANSFER-FAILED
        )

        ;; Emit event
        (print {
            event: "refund-processed",
            campaign-id: campaign-id,
            backer: backer,
            amount: refund-amount,
        })

        (ok refund-amount)
    )
)

;; Cancel campaign (creator only, before deadline, no pledges)
(define-public (cancel-campaign (campaign-id uint))
    (let ((campaign (unwrap! (map-get? campaigns { campaign-id: campaign-id })
            ERR-CAMPAIGN-NOT-FOUND
        )))
        ;; Validations
        (asserts! (is-eq tx-sender (get creator campaign)) ERR-NOT-AUTHORIZED)
        (asserts! (is-eq (get state campaign) STATE-ACTIVE) ERR-CAMPAIGN-ENDED)
        (asserts! (is-eq (get total-pledged campaign) u0) ERR-INVALID-AMOUNT)

        ;; Update campaign state
        (map-set campaigns { campaign-id: campaign-id }
            (merge campaign { state: STATE-CANCELLED })
        )

        ;; Emit event
        (print {
            event: "campaign-cancelled",
            campaign-id: campaign-id,
            creator: tx-sender,
        })

        (ok true)
    )
)

;; ========================================
;; ADMIN FUNCTIONS
;; ========================================

;; Update platform fee percentage
(define-public (set-platform-fee (new-fee uint))
    (begin
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        (asserts! (<= new-fee u10) ERR-INVALID-FEE) ;; Max 10% fee
        (var-set platform-fee-percentage new-fee)
        (print {
            event: "fee-updated",
            new-fee: new-fee,
        })
        (ok true)
    )
)

;; Pause contract
(define-public (pause-contract)
    (begin
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        (var-set contract-paused true)
        (print { event: "contract-paused" })
        (ok true)
    )
)

;; Unpause contract
(define-public (unpause-contract)
    (begin
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        (var-set contract-paused false)
        (print { event: "contract-unpaused" })
        (ok true)
    )
)

;; Withdraw platform fees
(define-public (withdraw-platform-fees)
    (let ((fees (var-get total-platform-fees)))
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        (asserts! (> fees u0) ERR-INVALID-AMOUNT)
        (var-set total-platform-fees u0)
        (unwrap! (as-contract (stx-transfer? fees tx-sender CONTRACT-OWNER))
            ERR-TRANSFER-FAILED
        )
        (print {
            event: "platform-fees-withdrawn",
            amount: fees,
        })
        (ok fees)
    )
)

;; ========================================
;; READ-ONLY FUNCTIONS
;; ========================================

;; Get campaign details
(define-read-only (get-campaign (campaign-id uint))
    (map-get? campaigns { campaign-id: campaign-id })
)

;; Get pledge details
(define-read-only (get-pledge
        (campaign-id uint)
        (backer principal)
    )
    (map-get? pledges {
        campaign-id: campaign-id,
        backer: backer,
    })
)

;; Get campaign backer count
(define-read-only (get-backer-count (campaign-id uint))
    (default-to { count: u0 }
        (map-get? campaign-backer-count { campaign-id: campaign-id })
    )
)

;; Get user campaign count
(define-read-only (get-user-campaign-count (user principal))
    (default-to { count: u0 } (map-get? user-campaign-count { user: user }))
)

;; Get user campaign by index
(define-read-only (get-user-campaign
        (user principal)
        (index uint)
    )
    (map-get? user-campaigns {
        user: user,
        campaign-index: index,
    })
)

;; Get campaign backer by index
(define-read-only (get-campaign-backer
        (campaign-id uint)
        (index uint)
    )
    (map-get? campaign-backers {
        campaign-id: campaign-id,
        backer-index: index,
    })
)

;; Get current campaign nonce
(define-read-only (get-campaign-nonce)
    (var-get campaign-nonce)
)

;; Get platform fee percentage
(define-read-only (get-platform-fee-percentage)
    (var-get platform-fee-percentage)
)

;; Get contract paused status
(define-read-only (is-contract-paused)
    (var-get contract-paused)
)

;; Get total platform fees
(define-read-only (get-total-platform-fees)
    (var-get total-platform-fees)
)

;; Check if campaign is successful
(define-read-only (is-campaign-successful (campaign-id uint))
    (match (map-get? campaigns { campaign-id: campaign-id })
        campaign (and
            (>= stacks-block-height (get deadline campaign))
            (>= (get total-pledged campaign) (get goal campaign))
        )
        false
    )
)

;; Check if campaign has failed
(define-read-only (is-campaign-failed (campaign-id uint))
    (match (map-get? campaigns { campaign-id: campaign-id })
        campaign (and
            (>= stacks-block-height (get deadline campaign))
            (< (get total-pledged campaign) (get goal campaign))
        )
        false
    )
)

;; Get campaign progress percentage (0-100)
(define-read-only (get-campaign-progress (campaign-id uint))
    (match (map-get? campaigns { campaign-id: campaign-id })
        campaign (if (is-eq (get goal campaign) u0)
            u0
            (/ (* (get total-pledged campaign) u100) (get goal campaign))
        )
        u0
    )
)
